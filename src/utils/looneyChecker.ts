import { LooneyJob, LooneyResult } from '@/types/looney';
import { loadLooneyHistory, MAX_RUNNING_LOONEY_AGE_MS, saveLooneyHistoryRecord, updateLooneyHistoryFromJob } from '@/utils/looneyHistory';
import { supabase } from '@/integrations/supabase/client';

export const MAX_LOONEY_FILE_BYTES = 50 * 1024 * 1024;
const JOB_RECOVERY_INTERVAL_MS = 2000;
const MAX_JOB_RECOVERY_ATTEMPTS = 150;
const BROWSER_RATE_LIMIT_KEY = 'renderdragon-looney-browser-id';

function createBrowserRateLimitId(): string {
  const webCrypto = typeof globalThis.crypto !== 'undefined' ? globalThis.crypto : undefined;
  if (typeof webCrypto?.randomUUID === 'function') return webCrypto.randomUUID();

  if (typeof webCrypto?.getRandomValues === 'function') {
    const bytes = webCrypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function getBrowserRateLimitId(): string {
  const existing = localStorage.getItem(BROWSER_RATE_LIMIT_KEY);
  if (existing) return existing;
  const created = createBrowserRateLimitId();
  localStorage.setItem(BROWSER_RATE_LIMIT_KEY, created);
  return created;
}

async function getLooneyRequestHeaders(contentType?: string): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'X-Looney-Browser-ID': getBrowserRateLimitId() };
  if (contentType) headers['Content-Type'] = contentType;
  const { data } = await supabase.auth.getSession();
  if (data.session?.access_token) headers.Authorization = `Bearer ${data.session.access_token}`;
  return headers;
}

export async function refreshRunningLooneyChecks(): Promise<void> {
  const running = loadLooneyHistory().filter((record) => record.status === 'queued' || record.status === 'running');
  await Promise.all(running.map(async (record) => {
    const createdAt = Date.parse(record.createdAt);
    if (!Number.isNaN(createdAt) && Date.now() - createdAt >= MAX_RUNNING_LOONEY_AGE_MS) {
      saveLooneyHistoryRecord({ ...record, status: 'failed', error: 'This check expired after the Looney service timeout.' });
      return;
    }
    try {
      const job = await getLooneyJob(record.jobId);
      saveLooneyHistoryRecord(updateLooneyHistoryFromJob(record, job));
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (/404|not found|unknown job|invalid job/i.test(message)) {
        saveLooneyHistoryRecord({ ...record, status: 'failed', error: 'This Looney job is no longer available.' });
      }
      // A temporary network failure should not falsely free a running slot.
    }
  }));
}

export interface LooneyCheckInput {
  fileUrl?: string;
  spotifyUrl?: string;
}

export interface LooneyCheckCallbacks {
  onJobCreated?: (job: LooneyJob) => void;
  onJobUpdate?: (job: LooneyJob) => void;
  onProgress?: (message: string) => void;
}

async function readJsonResponse(response: Response): Promise<Record<string, unknown>> {
  return response.json().catch(() => ({}));
}

export async function startLooneyJob(
  { fileUrl, spotifyUrl }: LooneyCheckInput,
  signal?: AbortSignal,
): Promise<LooneyJob> {
  if (!fileUrl && !spotifyUrl) {
    throw new Error('Choose an audio file or enter a Spotify track URL.');
  }

  const options: RequestInit = {
    method: 'POST',
    signal,
    headers: await getLooneyRequestHeaders('application/json'),
    body: JSON.stringify(fileUrl ? { file_url: fileUrl } : { spotify_url: spotifyUrl }),
  };

  const response = await fetch('/api/looney-check', options);
  const data = await readJsonResponse(response);
  if (!response.ok) {
    const message = data.error || data.detail || data.message || data.title;
    if (response.status === 429) {
      const retryAfter = Number(data.retry_after_seconds || response.headers.get('Retry-After') || 0);
      throw new Error(String(message || `Daily limit reached. Try again in ${Math.ceil(retryAfter / 3600)} hours.`));
    }
    throw new Error(String(message || `Looney could not process this track (${response.status}).`));
  }

  if (!data.job_id) {
    throw new Error('Looney did not return a job ID.');
  }

  return data as unknown as LooneyJob;
}

export async function getLooneyJob(jobId: string, signal?: AbortSignal): Promise<LooneyJob> {
  const response = await fetch(`/api/looney-check?job_id=${encodeURIComponent(jobId)}`, { signal });
  const job = await readJsonResponse(response);
  if (!response.ok) {
    const message = job.error || job.detail || job.message;
    throw new Error(String(message || `Unable to read the Looney job (${response.status}).`));
  }
  return job as unknown as LooneyJob;
}

async function waitForTerminalJob(
  jobId: string,
  signal?: AbortSignal,
  onProgress?: (message: string) => void,
): Promise<LooneyJob> {
  for (let attempt = 0; attempt < MAX_JOB_RECOVERY_ATTEMPTS; attempt += 1) {
    try {
      const job = await getLooneyJob(jobId, signal);
      if (job.status === 'complete' || job.status === 'failed' || job.result) return job;
      onProgress?.(job.status === 'queued' ? 'Your check is queued...' : 'Looney is still researching...');
    } catch (error) {
      if (signal?.aborted) throw error;
      onProgress?.('Connection interrupted. Reconnecting to Looney...');
    }
    await new Promise((resolve) => setTimeout(resolve, JOB_RECOVERY_INTERVAL_MS));
  }

  throw new Error('Looney took too long to finish this check.');
}

export async function streamLooneyJob(
  jobId: string,
  signal?: AbortSignal,
  onProgress?: (message: string) => void,
): Promise<LooneyJob> {
  const response = await fetch(`/api/looney-check?job_id=${encodeURIComponent(jobId)}&stream=1`, { signal });
  if (!response.ok) {
    const error = await readJsonResponse(response);
    const message = error.error || error.detail || error.message;
    throw new Error(String(message || `Unable to stream the Looney job (${response.status}).`));
  }

  if (!response.body) return getLooneyJob(jobId, signal);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let eventName = 'message';
  let eventData: string[] = [];
  let streamJob: LooneyJob | null = null;

  const processEvent = () => {
    if (eventData.length === 0) {
      eventName = 'message';
      return;
    }
    const rawData = eventData.join('\n');
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawData) as Record<string, unknown>;
    } catch {
      payload = { message: rawData };
    }

    const message = payload.message || payload.stage;
    if (eventName === 'progress' && message) onProgress?.(String(message));

    if (eventName === 'complete' || payload.status === 'complete') {
      streamJob = { ...payload, job_id: String(payload.job_id || jobId), status: 'complete' } as LooneyJob;
    } else if (eventName === 'failed' || payload.status === 'failed') {
      streamJob = { ...payload, job_id: String(payload.job_id || jobId), status: 'failed' } as LooneyJob;
    }

    eventName = 'message';
    eventData = [];
  };

  try {
    while (!streamJob) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line) {
          processEvent();
        } else if (line.startsWith('event:')) {
          eventName = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          eventData.push(line.slice(5).trim());
        }
      }

      if (done) {
        if (buffer) eventData.push(buffer.startsWith('data:') ? buffer.slice(5).trim() : buffer);
        processEvent();
        break;
      }
    }
  } catch (streamError) {
    if (signal?.aborted) throw streamError;
    return waitForTerminalJob(jobId, signal, onProgress);
  } finally {
    await reader.cancel().catch(() => undefined);
  }

  if (streamJob?.status === 'complete' && !streamJob.result) return waitForTerminalJob(jobId, signal, onProgress);
  if (streamJob) return streamJob;
  return waitForTerminalJob(jobId, signal, onProgress);
}

export async function checkWithLooney(
  input: LooneyCheckInput,
  signal?: AbortSignal,
  callbacks?: LooneyCheckCallbacks,
): Promise<LooneyResult> {
  const data = await startLooneyJob(input, signal);
  callbacks?.onJobCreated?.(data);
  callbacks?.onJobUpdate?.(data);
  const job = await streamLooneyJob(data.job_id, signal, callbacks?.onProgress);
  callbacks?.onJobUpdate?.(job);

  if (job.status === 'failed') {
    const message = job.error || job.detail || job.message || 'Looney could not complete this check.';
    throw new Error(String(message));
  }

  if (job.status !== 'complete') {
    throw new Error('Looney closed the progress stream before returning a result.');
  }

  return (job.result || job) as LooneyResult;
}

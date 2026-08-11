import { LooneyHistoryRecord, LooneyJob } from '@/types/looney';

const STORAGE_KEY = 'renderdragon-looney-history';
const MAX_HISTORY_RECORDS = 12;
const UPDATE_EVENT = 'looney-history-updated';

export const MAX_RUNNING_LOONEY_CHECKS = 2;
export const MAX_RUNNING_LOONEY_AGE_MS = 10 * 60 * 1000;

const isFreshRunningRecord = (record: LooneyHistoryRecord) => {
  if (record.status !== 'queued' && record.status !== 'running') return false;
  const createdAt = Date.parse(record.createdAt);
  return Number.isNaN(createdAt) || Date.now() - createdAt < MAX_RUNNING_LOONEY_AGE_MS;
};

export function findRunningLooneyCheck(sourceKey: string): LooneyHistoryRecord | undefined {
  return loadLooneyHistory().find((record) => {
    if (!isFreshRunningRecord(record)) return false;
    const legacySpotifyKey = record.sourceType === 'spotify' ? `spotify:${(record.sourceLabel.match(/track\/([a-zA-Z0-9]+)/)?.[1] || record.sourceLabel).toLowerCase()}` : '';
    return record.sourceKey === sourceKey || (!record.sourceKey && (sourceKey === `file:${record.sourceLabel.toLowerCase().trim()}` || sourceKey === legacySpotifyKey));
  });
}

export function countRunningLooneyChecks(): number {
  return loadLooneyHistory().filter(isFreshRunningRecord).length;
}

export function loadLooneyHistory(): LooneyHistoryRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

export function saveLooneyHistoryRecord(record: LooneyHistoryRecord): void {
  if (typeof window === 'undefined') return;
  const records = loadLooneyHistory().filter((item) => item.jobId !== record.jobId);
  records.unshift(record);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, MAX_HISTORY_RECORDS)));
    window.dispatchEvent(new Event(UPDATE_EVENT));
  } catch {
    // A large result should not prevent the current check from completing.
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, 5).map(({ result, ...item }) => item)));
      window.dispatchEvent(new Event(UPDATE_EVENT));
    } catch {
      // Storage may be disabled or full; the active check can still continue.
    }
  }
}

export function updateLooneyHistoryFromJob(
  current: LooneyHistoryRecord,
  job: LooneyJob,
): LooneyHistoryRecord {
  return {
    ...current,
    status: job.status || current.status,
    result: job.result || current.result,
    error: job.error || job.detail || job.message || current.error,
  };
}

export function clearLooneyHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

export { UPDATE_EVENT as looneyHistoryUpdateEvent };

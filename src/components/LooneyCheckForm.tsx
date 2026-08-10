import { DragEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { IconAlertCircle, IconFileMusic, IconLink, IconLoader2, IconUpload } from '@tabler/icons-react';
import { Resource, getResourceUrl } from '@/types/resources';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { checkWithLooney, MAX_LOONEY_FILE_BYTES, refreshRunningLooneyChecks } from '@/utils/looneyChecker';
import { LooneyHistoryRecord, LooneyResult } from '@/types/looney';
import { countRunningLooneyChecks, findRunningLooneyCheck, MAX_RUNNING_LOONEY_CHECKS, saveLooneyHistoryRecord, updateLooneyHistoryFromJob, loadLooneyHistory } from '@/utils/looneyHistory';
import LooneyResultDisplay from '@/components/LooneyResultDisplay';
import { useUploadThing } from '@/components/UploadThingClient';

type SourceTab = 'file' | 'spotify';
const pendingSourceKeys = new Set<string>();

interface LooneyCheckFormProps {
  initialResource?: Resource | null;
  autoStart?: boolean;
  onJobChange?: (jobId: string | null) => void;
  onResult?: (result: LooneyResult, sourceType: SourceTab, sourceLabel: string, jobId?: string) => void;
  onExistingJob?: (record: LooneyHistoryRecord) => void;
  onLimitReached?: () => void;
  onCheckStart?: () => void;
}

const isAudioFile = (file: File) => file.type.startsWith('audio/') || /\.(mp3|wav|m4a|flac|ogg|aac|opus)$/i.test(file.name);

const LooneyCheckForm = ({ initialResource, autoStart = false, onJobChange, onResult, onExistingJob, onLimitReached, onCheckStart }: LooneyCheckFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sourceTab, setSourceTab] = useState<SourceTab>('file');
  const [file, setFile] = useState<File | null>(null);
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [result, setResult] = useState<LooneyResult | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const autoRunId = useRef(0);
  const { startUpload } = useUploadThing('mediaUploader');

  const isCurrentAutoRun = (runId?: number) => runId === undefined || runId === autoRunId.current;

  const setSelectedFile = (nextFile: File | null) => {
    if (!nextFile) return;
    if (!isAudioFile(nextFile)) {
      setError('Choose an audio file such as MP3, WAV, M4A, FLAC, OGG, AAC, or OPUS.');
      return;
    }
    if (nextFile.size > MAX_LOONEY_FILE_BYTES) {
      setError('Audio files must be 50 MB or smaller.');
      return;
    }
    setError('');
    setResult(null);
    setFile(nextFile);
    setSourceTab('file');
  };

  const submitCheck = async (
    nextFile?: File,
    nextSpotifyUrl?: string,
    sourceOverride?: SourceTab,
    signal?: AbortSignal,
    runId?: number,
    nextFileUrl?: string,
  ) => {
    const selectedFile = nextFile ?? file;
    const selectedSpotifyUrl = nextSpotifyUrl ?? spotifyUrl.trim();
    setError('');
    setResult(null);
    await refreshRunningLooneyChecks();
    const sourceType = sourceOverride || sourceTab;
    const sourceLabel = initialResource?.title || (sourceType === 'file' ? selectedFile?.name : selectedSpotifyUrl) || 'Untitled check';
    const sourceKey = sourceType === 'spotify'
      ? `spotify:${(selectedSpotifyUrl.match(/track\/([a-zA-Z0-9]+)/)?.[1] || selectedSpotifyUrl).toLowerCase()}`
      : `file:${sourceLabel.toLowerCase().trim()}`;
    const existingJob = findRunningLooneyCheck(sourceKey);
    if (existingJob) {
      setIsLoading(false);
      setProgressMessage('');
      onExistingJob?.(existingJob);
      return;
    }
    if (pendingSourceKeys.has(sourceKey) || countRunningLooneyChecks() + pendingSourceKeys.size >= MAX_RUNNING_LOONEY_CHECKS) {
      setIsLoading(false);
      setProgressMessage('');
      onLimitReached?.();
      return;
    }
    pendingSourceKeys.add(sourceKey);
    onCheckStart?.();
    setProgressMessage('Connecting to Looney...');
    setIsLoading(true);

    try {
      let historyJobId: string | null = null;
      let fileUrl = nextFileUrl;
      if (selectedFile && !fileUrl) {
        setProgressMessage('Uploading audio securely...');
        const uploaded = await startUpload([selectedFile]);
        fileUrl = uploaded?.[0]?.ufsUrl || uploaded?.[0]?.url;
        if (!fileUrl) throw new Error('The audio upload did not return a public file URL.');
      }
      if (sourceType === 'file' && !fileUrl) throw new Error('No public file URL was available for this audio check.');
      const response = await checkWithLooney(
        sourceType === 'file' ? { fileUrl } : { spotifyUrl: selectedSpotifyUrl },
        signal,
        {
          onJobCreated: (job) => {
            const record: LooneyHistoryRecord = {
              jobId: job.job_id,
              sourceLabel,
              sourceType,
              createdAt: new Date().toISOString(),
              status: job.status,
              sourceKey,
            };
            historyJobId = job.job_id;
            saveLooneyHistoryRecord(record);
            onJobChange?.(job.job_id);
          },
          onJobUpdate: (job) => {
            const existing = loadLooneyHistory().find((record) => record.jobId === job.job_id);
            if (existing) saveLooneyHistoryRecord(updateLooneyHistoryFromJob(existing, job));
          },
          onProgress: (message) => {
            if (!isCurrentAutoRun(runId)) return;
            setProgressMessage(message);
            if (historyJobId) {
              const existing = loadLooneyHistory().find((record) => record.jobId === historyJobId);
              if (existing) saveLooneyHistoryRecord({ ...existing, progress: message });
            }
          },
        },
      );
      if (!isCurrentAutoRun(runId) || signal?.aborted) return;
      setResult(response);
      onResult?.(response, sourceType, sourceLabel, historyJobId || undefined);
    } catch (checkError) {
      if (signal?.aborted || !isCurrentAutoRun(runId)) return;
      setError(checkError instanceof Error ? checkError.message : 'Unable to check this track.');
    } finally {
      pendingSourceKeys.delete(sourceKey);
      if (isCurrentAutoRun(runId)) {
        setIsLoading(false);
        setProgressMessage('');
        onJobChange?.(null);
      }
    }
  };

  const loadResource = async (resource: Resource, signal: AbortSignal, runId: number) => {
    const resourceUrl = getResourceUrl(resource);
    if (!resourceUrl) {
      setError('This resource does not have an audio file to check.');
      setIsLoading(false);
      return;
    }

    try {
      const publicResourceUrl = new URL(resourceUrl, window.location.origin).toString();
      if (!isCurrentAutoRun(runId) || signal.aborted) return;
      await submitCheck(undefined, undefined, 'file', signal, runId, publicResourceUrl);
    } catch (loadError) {
      if (signal.aborted || !isCurrentAutoRun(runId)) return;
      setIsLoading(false);
      setError(loadError instanceof Error ? loadError.message : 'Unable to load this resource.');
    }
  };

  useEffect(() => {
    if (!autoStart || !initialResource) return;
    const runId = ++autoRunId.current;
    const controller = new AbortController();
    setSourceTab('file');
    setFile(null);
    setResult(null);
    setError('');
    setProgressMessage('');
    setIsLoading(true);
    const timer = window.setTimeout(() => void loadResource(initialResource, controller.signal, runId), 0);
    return () => { window.clearTimeout(timer); controller.abort(); };
    // The dialog creates a new check when the selected resource changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, initialResource]);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setSelectedFile(event.dataTransfer.files[0] || null);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (sourceTab === 'file' && !file) {
      setError('Choose an audio file first.');
      return;
    }
    if (sourceTab === 'spotify' && !spotifyUrl.trim()) {
      setError('Enter a Spotify track URL first.');
      return;
    }
    void submitCheck();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {!autoStart && (
        <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/30 p-1">
          <button type="button" onClick={() => setSourceTab('file')} className={cn('flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm transition-colors', sourceTab === 'file' ? 'bg-cow-purple text-white' : 'text-muted-foreground hover:text-foreground')}>
            <IconFileMusic className="h-4 w-4" /> Audio file
          </button>
          <button type="button" onClick={() => setSourceTab('spotify')} className={cn('flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm transition-colors', sourceTab === 'spotify' ? 'bg-cow-purple text-white' : 'text-muted-foreground hover:text-foreground')}>
            <IconLink className="h-4 w-4" /> Spotify URL
          </button>
        </div>
      )}

      {!autoStart && sourceTab === 'file' ? (
        <>
          <input ref={fileInputRef} type="file" accept="audio/*,.mp3,.wav,.m4a,.flac,.ogg,.aac,.opus" className="sr-only" onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} />
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            className="cursor-pointer rounded-lg border-2 border-dashed border-cow-purple/50 bg-cow-purple/5 p-8 text-center transition-colors hover:border-cow-purple hover:bg-cow-purple/10"
          >
            <IconUpload className="mx-auto h-8 w-8 text-cow-purple" />
            <p className="mt-3 font-jetbrains-mono text-sm font-semibold">{file ? file.name : 'Drop an audio file here or browse'}</p>
            <p className="mt-1 text-xs text-muted-foreground">MP3, WAV, M4A, FLAC, OGG, AAC, or OPUS up to 50 MB</p>
          </div>
        </>
      ) : !autoStart ? (
        <div className="space-y-2">
          <label htmlFor="looney-spotify-url" className="text-sm font-medium">Spotify track URL</label>
          <Input id="looney-spotify-url" value={spotifyUrl} onChange={(event) => setSpotifyUrl(event.target.value)} placeholder="https://open.spotify.com/track/..." className="pixel-corners" />
          <p className="text-xs text-muted-foreground">Use a public Spotify track link. The audio is processed by the Looney API.</p>
        </div>
      ) : null}

      {error && (
        <Alert variant="destructive" className="pixel-corners">
          <IconAlertCircle className="h-4 w-4" />
          <AlertTitle className="font-minecraftia">Check could not start</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!autoStart && (
        <Button type="submit" disabled={isLoading} className="pixel-btn-primary w-full">
          {isLoading ? <><IconLoader2 className="mr-2 h-4 w-4 animate-spin" /> {progressMessage || 'Researching track...'}</> : <><IconFileMusic className="mr-2 h-4 w-4" /> Check for copyright</>}
        </Button>
      )}

      {autoStart && isLoading && (
        <div className="rounded-lg border border-cow-purple/40 bg-cow-purple/5 p-8 text-center">
          <IconLoader2 className="mx-auto h-10 w-10 animate-spin text-cow-purple" />
          <p className="mt-4 font-minecraftia text-sm font-semibold">{progressMessage || 'Looney is researching this track...'}</p>
          {initialResource && <p className="mt-2 truncate text-xs text-muted-foreground">{initialResource.title}</p>}
          <p className="mt-2 text-xs text-muted-foreground">This can take a few minutes while sources are checked.</p>
        </div>
      )}

      {result && !isLoading && !onResult && <LooneyResultDisplay result={result} sourceType={sourceTab} sourceLabel={initialResource?.title || file?.name || spotifyUrl} />}
    </form>
  );
};

export default LooneyCheckForm;

export type LooneyValue = string | number | boolean | null | LooneyValue[] | { [key: string]: LooneyValue };

export type LooneyJobStatus = 'queued' | 'running' | 'complete' | 'failed';

export interface LooneyJob {
  job_id: string;
  status: LooneyJobStatus;
  result?: LooneyResult;
  error?: string;
  detail?: string;
  message?: string;
  status_url?: string;
}

export interface LooneyHistoryRecord {
  jobId: string;
  sourceLabel: string;
  sourceType: 'file' | 'spotify';
  createdAt: string;
  status: LooneyJobStatus;
  result?: LooneyResult;
  error?: string;
  progress?: string;
  sourceKey?: string;
}

export interface LooneyResult {
  request?: {
    track?: { [key: string]: LooneyValue };
    credits?: LooneyValue;
    [key: string]: LooneyValue | undefined;
  };
  research?: {
    status?: string;
    summary?: string;
    matches?: LooneyValue;
    sources?: LooneyValue;
    usage_assessment?: LooneyValue;
    official_licensing_contacts?: LooneyValue;
    warnings?: LooneyValue;
    [key: string]: LooneyValue | undefined;
  };
  ai_meta?: { [key: string]: LooneyValue };
  [key: string]: LooneyValue | undefined;
}

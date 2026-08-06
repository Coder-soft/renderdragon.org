export interface DownloadProgress {
  loaded: number;
  total: number | null;
  filename: string;
}

export const downloadFile = async (
  url: string,
  options: {
    filename: string;
    onProgress?: (progress: DownloadProgress) => void;
    signal?: AbortSignal;
  }
): Promise<boolean> => {
  const { filename, onProgress, signal } = options;

  try {
    const res = await fetch(url, {
      cache: "no-cache",
      signal,
    });
    if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);

    const total = Number(res.headers.get("content-length")) || null;
    const reader = res.body?.getReader();
    if (!reader) {
      const full = await res.blob();
      onProgress?.({ loaded: full.size, total: full.size, filename });
      saveBlob(full, filename);
      return true;
    }

    const chunks: BlobPart[] = [];
    let loaded = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.byteLength;
      onProgress?.({ loaded, total, filename });
    }

    const blob = new Blob(chunks);
    saveBlob(blob, filename);
    return true;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return false;
    }
    console.error("Download failed", err);
    return false;
  }
};

const saveBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
};
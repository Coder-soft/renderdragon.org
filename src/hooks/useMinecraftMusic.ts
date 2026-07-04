import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Resource } from '@/types/resources';
import { readCache, writeCache, cacheAudio } from '@/lib/cache';

const MINECRAFT_MUSIC_CACHE_KEY = 'minecraft-music:playlist';

interface PlaylistFile {
  name: string;
  size: number;
  url: string;
}

interface PlaylistResponse {
  count: number;
  updated: string;
  files: PlaylistFile[];
}

let globalCachePromise: Promise<void> | null = null;
let albumMapPromise: Promise<Map<string, string>> | null = null;

const fetchAlbumMap = async (): Promise<Map<string, string>> => {
  try {
    const res = await fetch('/data/albums.json');
    const data: Record<string, string[]> = await res.json();
    const map = new Map<string, string>();
    for (const [album, tracks] of Object.entries(data)) {
      for (const track of tracks) {
        map.set(track.replace(/\.mp3$/i, '').trim(), album);
      }
    }
    return map;
  } catch {
    return new Map();
  }
};

const fetchAndCachePlaylist = async (): Promise<PlaylistResponse | null> => {
  try {
    const res = await fetch('https://minecraft-playlist-api.powernplant101-c6b.workers.dev/list');
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    const body: unknown = await res.json();
    if (!isValidPlaylist(body)) {
      console.error('Invalid playlist data shape from API');
      return null;
    }
    writeCache(MINECRAFT_MUSIC_CACHE_KEY, body);
    return body;
  } catch (err) {
    console.error('Failed to fetch Minecraft playlist:', err);
    return null;
  }
};

const isValidPlaylist = (data: unknown): data is PlaylistResponse =>
  !!data && typeof data === 'object' && Array.isArray((data as PlaylistResponse).files);

const resolveLfsUrl = (url: string): string => {
  return url.replace('raw.githubusercontent.com/', 'media.githubusercontent.com/media/');
};

const ensurePlaylistCached = (): void => {
  if (globalCachePromise) return;
  const cached = readCache<PlaylistResponse>(MINECRAFT_MUSIC_CACHE_KEY);
  if (cached && isValidPlaylist(cached)) return;
  globalCachePromise = fetchAndCachePlaylist().finally(() => {
    globalCachePromise = null;
  });
};

const CONCURRENCY = 6;

export const useMinecraftMusic = (enabled = false) => {
  const [data, setData] = useState<PlaylistResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState('a-z');
  const [albumMap, setAlbumMap] = useState<Map<string, string>>(new Map());
  const [cachedBlobUrls, setCachedBlobUrls] = useState<Record<string, string>>({});
  const [preCacheEnabled, setPreCacheEnabled] = useState(false);
  const preCacheStarted = useRef(false);
  const albumMapLoaded = useRef(false);

  useEffect(() => {
    if (!enabled || albumMapLoaded.current) return;
    albumMapLoaded.current = true;
    if (!albumMapPromise) {
      albumMapPromise = fetchAlbumMap().finally(() => { albumMapPromise = null; });
    }
    albumMapPromise.then((m) => { setAlbumMap(m); return m; });
  }, [enabled]);

  const dataLoaded = useRef(false);

  useEffect(() => {
    if (!enabled || dataLoaded.current) return;
    dataLoaded.current = true;
    const load = async () => {
      setIsLoading(true);
      const cached = readCache<PlaylistResponse>(MINECRAFT_MUSIC_CACHE_KEY);
      if (cached && isValidPlaylist(cached)) {
        setData(cached);
        setIsLoading(false);
      }
      if (!globalCachePromise) {
        globalCachePromise = fetchAndCachePlaylist().finally(() => {
          globalCachePromise = null;
        });
      }
      const fresh = await globalCachePromise;
      if (fresh) setData(fresh);
      setIsLoading(false);
    };
    load();
  }, [enabled]);

  const blobUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!data || !preCacheEnabled || preCacheStarted.current) return;
    preCacheStarted.current = true;

    const files = data.files.filter(f => f.name.endsWith('.mp3'));
    const urlMap: Record<string, string> = {};
    let index = 0;
    let aborted = false;

    const processNext = async () => {
      while (index < files.length && !aborted) {
        const i = index++;
        const lfsUrl = resolveLfsUrl(files[i].url);
        try {
          const blob = await cacheAudio(lfsUrl);
          if (!blob || aborted) continue;
          const blobUrl = URL.createObjectURL(blob);
          blobUrlsRef.current.push(blobUrl);
          urlMap[lfsUrl] = blobUrl;
          if (i % 10 === 0 || i === files.length - 1) {
            setCachedBlobUrls(prev => ({ ...prev, ...urlMap }));
          }
        } catch {
          // skip individual file failures
        }
      }
      if (!aborted && Object.keys(urlMap).length > 0) {
        setCachedBlobUrls(prev => ({ ...prev, ...urlMap }));
      }
    };

    for (let i = 0; i < CONCURRENCY; i++) {
      processNext();
    }

    return () => {
      aborted = true;
      for (const url of blobUrlsRef.current) {
        URL.revokeObjectURL(url);
      }
      blobUrlsRef.current = [];
    };
  }, [data, preCacheEnabled]);

  const albumData = useMemo(() => {
    if (!data) return { albums: [], albumCounts: {} as Record<string, number> };
    const countMap: Record<string, number> = {};
    data.files
      .filter(f => f.name.endsWith('.mp3'))
      .forEach(f => {
        const name = f.name.replace(/\.mp3$/i, '').trim();
        const album = albumMap.get(name) || 'Other';
        countMap[album] = (countMap[album] || 0) + 1;
      });
    const albums = Object.keys(countMap).sort((a, b) => {
      if (a === 'Other') return 1;
      if (b === 'Other') return -1;
      return a.localeCompare(b);
    });
    return { albums, albumCounts: countMap };
  }, [data, albumMap]);

  const albums = albumData.albums;
  const albumCounts = albumData.albumCounts;

  const resources: Resource[] = useMemo(() => {
    if (!data) return [];
    return data.files
      .filter(f => {
        if (!f.name.endsWith('.mp3')) return false;
        const name = f.name.replace(/\.mp3$/i, '').trim();
        const album = albumMap.get(name) || 'Other';
        if (selectedAlbum && album !== selectedAlbum) return false;
        if (searchQuery && !f.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'a-z') return a.name.localeCompare(b.name);
        if (sortOrder === 'z-a') return b.name.localeCompare(a.name);
        return 0;
      })
      .map((f) => {
        const name = f.name.replace(/\.mp3$/i, '').trim();
        const album = albumMap.get(name) || 'Other';
        const parts = name.split(' - ', 2);
        const title = parts.length > 1 ? parts[1].trim() : name;
        const lfsUrl = resolveLfsUrl(f.url);
        return {
          id: `mc-music-${f.name}`,
          title,
          category: 'minecraft-music' as const,
          subcategory: album,
          filetype: 'mp3',
          download_url: cachedBlobUrls[lfsUrl] || lfsUrl,
          filename: f.name,
        };
      });
  }, [data, selectedAlbum, searchQuery, sortOrder, cachedBlobUrls, albumMap]);

  const enablePreCache = useCallback(() => {
    setPreCacheEnabled(true);
  }, []);

  const handleSortOrderChange = useCallback((order: string) => {
    setSortOrder(order);
  }, []);

  return {
    resources,
    albums,
    albumCounts,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedAlbum,
    setSelectedAlbum,
    sortOrder,
    handleSortOrderChange,
    enablePreCache,
  };
};

export { ensurePlaylistCached };

/**
 * Guest (signed-out) favourites + folders backed by localStorage.
 * Everything here is device-local and never synced across devices.
 * When a user signs in, this data is ignored in favour of the Supabase
 * backend; when they sign out, they return to this local data.
 */

export const GUEST_FAVORITES_KEY = 'rd_guest_favorites';
export const GUEST_FOLDERS_KEY = 'rd_guest_folders';

export const GUEST_CHANGE_EVENT = 'guestFavoritesChanged';

const LEGACY_HEARTED_KEY = 'heartedResources';

export interface GuestFavorite {
  resource_url: string;
  folder_id: string | null;
}

export interface GuestFolder {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  color: string | null;
  created_at: string;
}

function safeParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

export function genId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `gf-${crypto.randomUUID()}`;
  }
  return `gf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function notifyGuestFavoritesChanged(): void {
  window.dispatchEvent(new CustomEvent(GUEST_CHANGE_EVENT));
}

// ---- Favourites -----------------------------------------------------------

function readGuestFavoritesFromStorage(): GuestFavorite[] {
  return safeParse<GuestFavorite[]>(localStorage.getItem(GUEST_FAVORITES_KEY), []);
}

/**
 * Read favourites, migrating the legacy flat "heartedResources" string[]
 * into the { resource_url, folder_id } shape (all unassigned).
 */
export function readGuestFavorites(): GuestFavorite[] {
  const stored = readGuestFavoritesFromStorage();
  if (stored.length > 0) return stored;

  const raw = safeParse<unknown[] | null>(localStorage.getItem(LEGACY_HEARTED_KEY), null);
  if (Array.isArray(raw)) {
    const migrated = raw
      .filter((x): x is string => typeof x === 'string')
      .map((resource_url) => ({ resource_url, folder_id: null }));
    if (migrated.length > 0) {
      writeGuestFavorites(migrated, false);
      localStorage.removeItem(LEGACY_HEARTED_KEY);
    }
    return migrated;
  }
  return [];
}

export function writeGuestFavorites(favorites: GuestFavorite[], shouldNotify = true): void {
  localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(favorites));
  if (shouldNotify) notifyGuestFavoritesChanged();
}

// ----------------------------------------------------------------- Folders -

export function readGuestFolders(): GuestFolder[] {
  return safeParse<GuestFolder[]>(localStorage.getItem(GUEST_FOLDERS_KEY), []);
}

export function writeGuestFolders(folders: GuestFolder[], shouldNotify = true): void {
  localStorage.setItem(GUEST_FOLDERS_KEY, JSON.stringify(folders));
  if (shouldNotify) notifyGuestFavoritesChanged();
}
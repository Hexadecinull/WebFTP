// Model Layer - Bookmark storage helpers
// Kept separate from BookmarksDialog so that file only exports a component
// (required for React Fast Refresh / HMR to work correctly).

export interface BookmarkItem {
  id: string;
  path: string;
  name: string;
  host: string;
  timestamp: number;
}

export function getBookmarkKey(userId: string | undefined): string {
  return userId ? `bookmarks_${userId}` : 'bookmarks_guest';
}

export function loadBookmarks(userId: string | undefined): BookmarkItem[] {
  try {
    const raw = localStorage.getItem(getBookmarkKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBookmark(
  userId: string | undefined,
  path: string,
  host: string
): void {
  const bookmarks = loadBookmarks(userId);
  const name = path.split('/').filter(Boolean).pop() || '/';
  if (bookmarks.some(b => b.path === path && b.host === host)) return;
  const updated = [
    { id: Date.now().toString(), path, name, host, timestamp: Date.now() },
    ...bookmarks,
  ].slice(0, 100);
  localStorage.setItem(getBookmarkKey(userId), JSON.stringify(updated));
}

export function removeBookmark(userId: string | undefined, id: string): void {
  const updated = loadBookmarks(userId).filter(b => b.id !== id);
  localStorage.setItem(getBookmarkKey(userId), JSON.stringify(updated));
}

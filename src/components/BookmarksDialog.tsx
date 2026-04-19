// View Layer - Bookmarks Dialog

import { useState } from 'react';
import { Bookmark, Trash2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

interface BookmarkItem {
  id: string;
  path: string;
  name: string;
  host: string;
  timestamp: number;
}

interface BookmarksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (path: string) => void;
}

// Bookmarks are keyed by user ID (logged-in) or 'guest' so each account
// gets its own list. Stored as JSON in localStorage under 'bookmarks_<key>'.
function getStorageKey(userId: string | undefined): string {
  return userId ? `bookmarks_${userId}` : 'bookmarks_guest';
}

export function loadBookmarks(userId: string | undefined): BookmarkItem[] {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
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
  // Avoid duplicates for same host+path
  if (bookmarks.some(b => b.path === path && b.host === host)) return;
  const updated = [
    { id: Date.now().toString(), path, name, host, timestamp: Date.now() },
    ...bookmarks,
  ].slice(0, 100);
  localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
}

export function removeBookmark(userId: string | undefined, id: string): void {
  const updated = loadBookmarks(userId).filter(b => b.id !== id);
  localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
}

export const BookmarksDialog = ({ open, onOpenChange, onNavigate }: BookmarksDialogProps) => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() =>
    loadBookmarks(user?.id)
  );

  // Refresh list when dialog opens (might have been updated externally)
  const handleOpenChange = (v: boolean) => {
    if (v) setBookmarks(loadBookmarks(user?.id));
    onOpenChange(v);
  };

  const handleDelete = (id: string) => {
    removeBookmark(user?.id, id);
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const handleNavigate = (path: string) => {
    onNavigate(path);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            Bookmarks
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {bookmarks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bookmark className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No bookmarks yet</p>
                <p className="text-xs mt-1">Right-click a folder to bookmark it</p>
              </div>
            ) : (
              bookmarks.map(bookmark => (
                <div
                  key={bookmark.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:border-primary transition-colors group"
                >
                  <div className="flex-1 cursor-pointer min-w-0" onClick={() => handleNavigate(bookmark.path)}>
                    <p className="font-medium truncate">{bookmark.name}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">{bookmark.host} — {bookmark.path}</p>
                  </div>
                  <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="ghost" onClick={() => handleNavigate(bookmark.path)}>
                      <FolderOpen className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(bookmark.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

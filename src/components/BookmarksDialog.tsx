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

interface BookmarkItem {
  id: string;
  path: string;
  name: string;
  timestamp: number;
}

interface BookmarksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (path: string) => void;
}

export const BookmarksDialog = ({ open, onOpenChange, onNavigate }: BookmarksDialogProps) => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    const stored = localStorage.getItem('bookmarks');
    return stored ? JSON.parse(stored) : [];
  });

  const handleDelete = (id: string) => {
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    localStorage.setItem('bookmarks', JSON.stringify(updated));
  };

  const handleNavigate = (path: string) => {
    onNavigate(path);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                <p>No bookmarks yet</p>
              </div>
            ) : (
              bookmarks.map(bookmark => (
                <div
                  key={bookmark.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:border-primary transition-colors group"
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => handleNavigate(bookmark.path)}
                  >
                    <p className="font-medium">{bookmark.name}</p>
                    <p className="text-sm text-muted-foreground font-mono">{bookmark.path}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleNavigate(bookmark.path)}
                    >
                      <FolderOpen className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(bookmark.id)}
                    >
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

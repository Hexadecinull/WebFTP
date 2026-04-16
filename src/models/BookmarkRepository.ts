// Model Layer - Bookmark Repository

import { Bookmark } from '@/types/ftp';

const STORAGE_KEY = 'ftp_bookmarks';

export class BookmarkRepository {
  getAll(): Bookmark[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    try {
      const bookmarks = JSON.parse(stored) as (Omit<Bookmark, 'createdAt'> & { createdAt: string })[];
      return bookmarks.map((b) => ({
        ...b,
        createdAt: new Date(b.createdAt),
      }));
    } catch {
      return [];
    }
  }

  save(bookmark: Omit<Bookmark, 'id' | 'createdAt'>): Bookmark {
    const bookmarks = this.getAll();
    const newBookmark: Bookmark = {
      ...bookmark,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date(),
    };
    
    bookmarks.push(newBookmark);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    return newBookmark;
  }

  delete(id: string): void {
    const bookmarks = this.getAll().filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  }

  update(id: string, updates: Partial<Bookmark>): void {
    const bookmarks = this.getAll();
    const index = bookmarks.findIndex(b => b.id === id);
    if (index !== -1) {
      bookmarks[index] = { ...bookmarks[index], ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    }
  }
}

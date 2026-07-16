// View Layer - Archive Browser Dialog
// Lists the contents of a ZIP archive and lets you extract individual files.
// Note: only ZIP supports content listing/extraction currently — TAR/RAR/7Z
// can still be downloaded as-is but their internals aren't browsable yet.

import { useState, useEffect, useMemo } from 'react';
import { Archive, Folder, File, Download, ChevronRight, Home, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { formatBytes } from '@/lib/fileUtils';
import { toast } from '@/hooks/use-toast';

interface ArchiveEntry {
  name: string;
  size: number;
  compressedSize: number;
  isDirectory: boolean;
}

interface ArchiveBrowserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  archivePath: string;
  archiveName: string;
  proxyUrl: string;
  sessionId: string;
}

export const ArchiveBrowserDialog = ({
  open, onOpenChange, archivePath, archiveName, proxyUrl, sessionId,
}: ArchiveBrowserDialogProps) => {
  const [entries, setEntries] = useState<ArchiveEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDir, setCurrentDir] = useState('');
  const [extracting, setExtracting] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    setCurrentDir('');
    fetch(`${proxyUrl}/api/archive/list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, remotePath: archivePath }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({ message: 'Failed to read archive' }));
          throw new Error(err.message);
        }
        return res.json();
      })
      .then((data) => setEntries(data.entries || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [open, archivePath, proxyUrl, sessionId]);

  // Build a virtual folder tree view from flat entry names (e.g. "src/utils/a.js")
  const visibleItems = useMemo(() => {
    const prefix = currentDir ? `${currentDir}/` : '';
    const dirs = new Set<string>();
    const files: ArchiveEntry[] = [];

    for (const entry of entries) {
      if (!entry.name.startsWith(prefix)) continue;
      const rest = entry.name.slice(prefix.length);
      if (!rest) continue;
      const slashIdx = rest.indexOf('/');
      if (slashIdx === -1) {
        if (!entry.isDirectory) files.push(entry);
      } else {
        dirs.add(rest.slice(0, slashIdx));
      }
    }

    return {
      dirs: Array.from(dirs).sort(),
      files: files.sort((a, b) => a.name.localeCompare(b.name)),
    };
  }, [entries, currentDir]);

  const handleExtract = async (entryName: string) => {
    setExtracting(entryName);
    try {
      const res = await fetch(`${proxyUrl}/api/archive/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, remotePath: archivePath, entryName }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Extraction failed' }));
        throw new Error(err.message);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = entryName.split('/').pop() || entryName;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Extracted', description: `${a.download} downloaded` });
    } catch (err) {
      toast({ title: 'Extraction failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setExtracting(null);
    }
  };

  const breadcrumbSegments = currentDir ? currentDir.split('/') : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            {archiveName}
          </DialogTitle>
          <DialogDescription>
            Browse and extract files from this archive.
          </DialogDescription>
        </DialogHeader>

        {/* Breadcrumb inside archive */}
        <div className="flex items-center gap-1 text-sm px-1 flex-wrap">
          <Button variant="ghost" size="sm" className="h-6 px-1.5" onClick={() => setCurrentDir('')}>
            <Home className="h-3 w-3" />
          </Button>
          {breadcrumbSegments.map((seg, i) => (
            <div key={i} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-1.5 font-mono text-xs"
                onClick={() => setCurrentDir(breadcrumbSegments.slice(0, i + 1).join('/'))}
              >
                {seg}
              </Button>
            </div>
          ))}
        </div>

        <ScrollArea className="flex-1 h-[350px] border border-border rounded-md">
          {loading && (
            <div className="flex items-center justify-center h-full py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {error && (
            <div className="p-4 text-sm text-destructive">{error}</div>
          )}
          {!loading && !error && (
            <div className="divide-y divide-border">
              {visibleItems.dirs.length === 0 && visibleItems.files.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Empty folder</p>
              )}
              {visibleItems.dirs.map((dir) => (
                <button
                  key={dir}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-accent/30 text-left"
                  onClick={() => setCurrentDir(currentDir ? `${currentDir}/${dir}` : dir)}
                >
                  <Folder className="h-4 w-4 text-accent shrink-0" />
                  <span className="text-sm truncate">{dir}</span>
                </button>
              ))}
              {visibleItems.files.map((file) => {
                const shortName = file.name.split('/').pop() || file.name;
                return (
                  <div key={file.name} className="flex items-center gap-2 px-3 py-2 hover:bg-accent/20">
                    <File className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate flex-1">{shortName}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{formatBytes(file.size)}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 shrink-0"
                      disabled={extracting === file.name}
                      onClick={() => handleExtract(file.name)}
                    >
                      {extracting === file.name ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

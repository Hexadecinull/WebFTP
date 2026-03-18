import { useState, useRef, useCallback } from 'react';
import { Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (files: File[]) => void;
}

export const UploadDialog = ({ open, onOpenChange, onUpload }: UploadDialogProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (files) {
      setSelectedFiles(prev => [...prev, ...Array.from(files)]);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const items = e.dataTransfer.items;
    if (items) {
      const filePromises: Promise<File[]>[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i].webkitGetAsEntry?.();
        if (item) {
          filePromises.push(traverseEntry(item));
        }
      }
      const allFiles = (await Promise.all(filePromises)).flat();
      if (allFiles.length > 0) {
        setSelectedFiles(prev => [...prev, ...allFiles]);
      }
    } else {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const traverseEntry = (entry: FileSystemEntry): Promise<File[]> => {
    return new Promise((resolve) => {
      if (entry.isFile) {
        (entry as FileSystemFileEntry).file((file) => {
          // Preserve relative path
          const fileWithPath = new File([file], entry.fullPath.replace(/^\//, ''), { type: file.type, lastModified: file.lastModified });
          resolve([fileWithPath]);
        });
      } else if (entry.isDirectory) {
        const dirReader = (entry as FileSystemDirectoryEntry).createReader();
        dirReader.readEntries(async (entries) => {
          const files: File[] = [];
          for (const child of entries) {
            const childFiles = await traverseEntry(child);
            files.push(...childFiles);
          }
          resolve(files);
        });
      } else {
        resolve([]);
      }
    });
  };

  const handleSubmit = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
      setSelectedFiles([]);
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setSelectedFiles([]);
    onOpenChange(false);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Upload File
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragActive
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50 hover:bg-accent/30'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium">
              Drag & drop your file(s) or folders here or click to select files
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Any file type supported
            </p>
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <input
              ref={folderInputRef}
              type="file"
              multiple
              className="hidden"
              {...({ webkitdirectory: '', directory: '' } as any)}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>


          {selectedFiles.length > 0 && (
            <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
              {selectedFiles.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded-md text-sm">
                  <span className="truncate flex-1">{file.name}</span>
                  <span className="text-xs text-muted-foreground mx-2">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={selectedFiles.length === 0}>
            Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

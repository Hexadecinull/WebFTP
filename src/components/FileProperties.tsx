// View Layer - File Properties Dialog

import { FtpEntry } from '@/types/ftp';
import { formatBytes, formatDate } from '@/lib/fileUtils';
import { getFileType } from '@/lib/fileTypes';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { File, Folder } from 'lucide-react';

interface FilePropertiesProps {
  file: FtpEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FileProperties = ({
  file,
  open,
  onOpenChange,
}: FilePropertiesProps) => {
  if (!file) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md data-[state=open]:animate-enter data-[state=closed]:animate-exit">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {file.isDirectory ? (
              <Folder className="h-5 w-5 text-accent" />
            ) : (
              <File className="h-5 w-5 text-muted-foreground" />
            )}
            Properties
          </DialogTitle>
          <DialogDescription>Details for {file.name}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b border-border animate-fade-in" style={{ animationDelay: '0ms' }}>
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{file.name}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-border animate-fade-in" style={{ animationDelay: '50ms' }}>
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium">
                {file.isDirectory ? 'Folder' : getFileType(file.name)}
              </span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-border animate-fade-in" style={{ animationDelay: '100ms' }}>
              <span className="text-muted-foreground">Path:</span>
              <span className="font-medium font-mono text-sm truncate max-w-[200px]">
                {file.path}
              </span>
            </div>
            
            {!file.isDirectory && file.size !== undefined && (
              <div className="flex justify-between py-2 border-b border-border animate-fade-in" style={{ animationDelay: '150ms' }}>
                <span className="text-muted-foreground">Size:</span>
                <span className="font-medium font-mono">
                  {formatBytes(file.size)}
                </span>
              </div>
            )}
            
            {file.permissions && (
              <div className="flex justify-between py-2 border-b border-border animate-fade-in" style={{ animationDelay: '200ms' }}>
                <span className="text-muted-foreground">Permissions:</span>
                <span className="font-medium font-mono">{file.permissions}</span>
              </div>
            )}
            
            {file.modifiedAt && (
              <div className="flex justify-between py-2 border-b border-border animate-fade-in" style={{ animationDelay: '250ms' }}>
                <span className="text-muted-foreground">Modified:</span>
                <span className="font-medium">{formatDate(file.modifiedAt)}</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

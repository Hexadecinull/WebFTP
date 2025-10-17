// View Layer - File List Component

import { File, Folder, ArrowLeft } from 'lucide-react';
import { FtpEntry } from '@/types/ftp';
import { formatBytes, formatDate, isEditableFile } from '@/lib/fileUtils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileContextMenu } from './FileContextMenu';

interface FileListProps {
  files: FtpEntry[];
  onFileClick: (file: FtpEntry) => void;
  onFileDoubleClick: (file: FtpEntry) => void;
  onDownload: (file: FtpEntry) => void;
  onDelete: (file: FtpEntry) => void;
  onEdit: (file: FtpEntry) => void;
  onOpen: (file: FtpEntry) => void;
  onProperties: (file: FtpEntry) => void;
  selectedFile?: FtpEntry;
}

export const FileList = ({
  files,
  onFileClick,
  onFileDoubleClick,
  onDownload,
  onDelete,
  onEdit,
  onOpen,
  onProperties,
  selectedFile,
}: FileListProps) => {
  return (
    <ScrollArea className="h-full">
      <div className="divide-y divide-border">
        {files.map((file) => (
          <FileContextMenu
            key={file.path}
            file={file}
            onDownload={onDownload}
            onDelete={onDelete}
            onEdit={onEdit}
            onOpen={onOpen}
            onProperties={onProperties}
            canEdit={!file.isDirectory && isEditableFile(file.name)}
          >
            <div
              className={`
                flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-accent/50
                ${selectedFile?.path === file.path ? 'bg-primary/10 border-l-2 border-primary' : ''}
              `}
              onClick={() => onFileClick(file)}
              onDoubleClick={() => {
                // Handle ".." navigation specially
                if (file.name === '..' && file.isDirectory) {
                  onOpen(file);
                } else {
                  onFileDoubleClick(file);
                }
              }}
            >
            <div className="flex-shrink-0">
              {file.name === '..' ? (
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              ) : file.isDirectory ? (
                <Folder className="h-5 w-5 text-accent" />
              ) : (
                <File className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{file.name}</p>
              {file.permissions && (
                <p className="text-xs text-muted-foreground font-mono">
                  {file.permissions}
                </p>
              )}
            </div>

            <div className="flex-shrink-0 text-right text-sm text-muted-foreground">
              {file.size !== undefined && (
                <p className="font-mono">{formatBytes(file.size)}</p>
              )}
              {file.modifiedAt && (
                <p className="text-xs">{formatDate(file.modifiedAt)}</p>
              )}
            </div>
            </div>
          </FileContextMenu>
        ))}

        {files.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            Empty directory
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

import { FtpEntry } from '@/types/ftp';
import { formatBytes } from '@/lib/fileUtils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileContextMenu } from './FileContextMenu';
import { FileIcon } from './FileIcon';
import { ArrowLeft } from 'lucide-react';
import { isEditableFile } from '@/lib/fileUtils';

interface FileGridProps {
  files: FtpEntry[];
  onFileClick: (file: FtpEntry) => void;
  onFileDoubleClick: (file: FtpEntry) => void;
  onDownload: (file: FtpEntry) => void;
  onDelete: (file: FtpEntry) => void;
  onEdit: (file: FtpEntry) => void;
  onOpen: (file: FtpEntry) => void;
  onProperties: (file: FtpEntry) => void;
  onRename?: (file: FtpEntry) => void;
  onDownloadFolder?: (file: FtpEntry) => void;
  selectedFile?: FtpEntry;
  onDragStart?: (e: React.DragEvent, file: FtpEntry) => void;
  onDropOnFolder?: (e: React.DragEvent, folder: FtpEntry) => void;
}

export const FileGrid = ({
  files,
  onFileClick,
  onFileDoubleClick,
  onDownload,
  onDelete,
  onEdit,
  onOpen,
  onProperties,
  onRename,
  onDownloadFolder,
  selectedFile,
  onDragStart,
  onDropOnFolder,
}: FileGridProps) => {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3">
        {files.map((file) => (
          <FileContextMenu
            key={file.path}
            file={file}
            onDownload={onDownload}
            onDelete={onDelete}
            onEdit={onEdit}
            onOpen={onOpen}
            onProperties={onProperties}
            onRename={onRename}
            onDownloadFolder={onDownloadFolder}
            canEdit={!file.isDirectory && isEditableFile(file.name)}
          >
            <div
              draggable={file.name !== '..'}
              onDragStart={(e) => {
                if (file.name !== '..' && onDragStart) onDragStart(e, file);
              }}
              onDragOver={(e) => {
                if (file.isDirectory && file.name !== '..') {
                  e.preventDefault();
                  e.currentTarget.classList.add('ring-2', 'ring-primary');
                }
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('ring-2', 'ring-primary');
              }}
              onDrop={(e) => {
                e.currentTarget.classList.remove('ring-2', 'ring-primary');
                if (file.isDirectory && file.name !== '..' && onDropOnFolder) {
                  onDropOnFolder(e, file);
                }
              }}
              className={`
                flex flex-col items-center gap-1.5 p-3 rounded-lg cursor-pointer transition-all
                hover:bg-accent/50
                ${selectedFile?.path === file.path ? 'bg-primary/10 ring-1 ring-primary' : ''}
              `}
              onClick={() => onFileClick(file)}
              onDoubleClick={() => {
                if (file.name === '..' && file.isDirectory) {
                  onOpen(file);
                } else {
                  onFileDoubleClick(file);
                }
              }}
            >
              <div className="h-10 w-10 flex items-center justify-center">
                {file.name === '..' ? (
                  <ArrowLeft className="h-6 w-6 text-muted-foreground" />
                ) : (
                  <FileIcon filename={file.name} isDirectory={file.isDirectory} className="scale-150" />
                )}
              </div>
              <span className="text-xs text-center truncate w-full font-medium">{file.name}</span>
              {file.size !== undefined && !file.isDirectory && (
                <span className="text-[10px] text-muted-foreground">{formatBytes(file.size)}</span>
              )}
            </div>
          </FileContextMenu>
        ))}

        {files.length === 0 && (
          <div className="col-span-full flex items-center justify-center h-32 text-muted-foreground">
            Empty directory
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

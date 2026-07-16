import { ArrowLeft } from 'lucide-react';
import { FtpEntry } from '@/types/ftp';
import { formatBytes, formatDate, isEditableFile } from '@/lib/fileUtils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileContextMenu } from './FileContextMenu';
import { FileIcon } from './FileIcon';

interface FileListProps {
  files: FtpEntry[];
  onFileClick: (file: FtpEntry, ctrlKey: boolean) => void;
  onFileDoubleClick: (file: FtpEntry) => void;
  onDownload: (file: FtpEntry) => void;
  onDelete: (file: FtpEntry) => void;
  onEdit: (file: FtpEntry) => void;
  onOpen: (file: FtpEntry) => void;
  onProperties: (file: FtpEntry) => void;
  onRename?: (file: FtpEntry) => void;
  onDownloadFolder?: (file: FtpEntry) => void;
  onBookmark?: (file: FtpEntry) => void;
  onCopy?: (file: FtpEntry) => void;
  onCut?: (file: FtpEntry) => void;
  onPaste?: () => void;
  onSelectAll?: () => void;
  allSelected?: boolean;
  selectedFiles: FtpEntry[];
  hasClipboard?: boolean;
  onDragStart?: (e: React.DragEvent, file: FtpEntry) => void;
  onDropOnFolder?: (e: React.DragEvent, folder: FtpEntry) => void;
}

export const FileList = ({
  files, onFileClick, onFileDoubleClick, onDownload, onDelete, onEdit,
  onOpen, onProperties, onRename, onDownloadFolder, onBookmark,
  onCopy, onCut, onPaste, onSelectAll, allSelected, selectedFiles, hasClipboard,
  onDragStart, onDropOnFolder,
}: FileListProps) => {
  return (
    <ScrollArea className="h-full">
      <div className="divide-y divide-border px-2 py-1">
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
            onBookmark={onBookmark}
            onCopy={onCopy}
            onCut={onCut}
            onPaste={onPaste}
            onSelectAll={onSelectAll}
            allSelected={allSelected}
            hasClipboard={hasClipboard}
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
                  e.currentTarget.classList.add('bg-primary/20');
                }
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('bg-primary/20');
              }}
              onDrop={(e) => {
                e.currentTarget.classList.remove('bg-primary/20');
                if (file.isDirectory && file.name !== '..' && onDropOnFolder) {
                  onDropOnFolder(e, file);
                }
              }}
              className={`
                flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-accent/50
                ${selectedFiles.some(f => f.path === file.path) ? 'bg-primary/10 border-l-2 border-primary' : ''}
              `}
              onClick={(e) => onFileClick(file, e.ctrlKey || e.metaKey)}
              onDoubleClick={() => {
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
                ) : (
                  <FileIcon filename={file.name} isDirectory={file.isDirectory} />
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
                {file.isDirectory ? (
                  <p className="font-mono text-muted-foreground/50">--</p>
                ) : file.size !== undefined && (
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

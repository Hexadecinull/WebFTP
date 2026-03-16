// View Layer - File Context Menu Component

import { Download, Trash2, Edit, FolderOpen, FileText, Archive } from 'lucide-react';
import { FtpEntry } from '@/types/ftp';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

interface FileContextMenuProps {
  file: FtpEntry;
  children: React.ReactNode;
  onDownload: (file: FtpEntry) => void;
  onDelete: (file: FtpEntry) => void;
  onEdit: (file: FtpEntry) => void;
  onOpen: (file: FtpEntry) => void;
  onProperties: (file: FtpEntry) => void;
  onRename?: (file: FtpEntry) => void;
  onDownloadFolder?: (file: FtpEntry) => void;
  canEdit: boolean;
}

export const FileContextMenu = ({
  file,
  children,
  onDownload,
  onDelete,
  onEdit,
  onOpen,
  onProperties,
  onRename,
  onDownloadFolder,
  canEdit,
}: FileContextMenuProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56 bg-popover border-border">
        {file.isDirectory ? (
          <>
            <ContextMenuItem onClick={() => onOpen(file)} className="gap-2">
              <FolderOpen className="h-4 w-4" />
              <span>Open Folder</span>
            </ContextMenuItem>
            {file.name !== '..' && onRename && (
              <ContextMenuItem onClick={() => onRename(file)} className="gap-2">
                <Edit className="h-4 w-4" />
                <span>Rename</span>
              </ContextMenuItem>
            )}
            {file.name !== '..' && onDownloadFolder && (
              <ContextMenuItem onClick={() => onDownloadFolder(file)} className="gap-2">
                <Archive className="h-4 w-4" />
                <span>Download as Archive</span>
              </ContextMenuItem>
            )}
          </>
        ) : (
          <>
            <ContextMenuItem onClick={() => onDownload(file)} className="gap-2">
              <Download className="h-4 w-4" />
              <span>Download</span>
            </ContextMenuItem>
            {canEdit && (
              <ContextMenuItem onClick={() => onEdit(file)} className="gap-2">
                <Edit className="h-4 w-4" />
                <span>Edit File</span>
              </ContextMenuItem>
            )}
          </>
        )}
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={() => onProperties(file)} className="gap-2">
          <FileText className="h-4 w-4" />
          <span>Properties</span>
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        {file.name !== '..' && (
          <ContextMenuItem 
            onClick={() => onDelete(file)} 
            className="gap-2 text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};

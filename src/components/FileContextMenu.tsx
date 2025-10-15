// View Layer - File Context Menu Component

import { Download, Trash2, Edit, FolderOpen, FileText, Copy, Share2 } from 'lucide-react';
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
  canEdit,
}: FileContextMenuProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56 bg-popover border-border">
        {file.isDirectory ? (
          <ContextMenuItem onClick={() => onOpen(file)} className="gap-2">
            <FolderOpen className="h-4 w-4" />
            <span>Open Folder</span>
          </ContextMenuItem>
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

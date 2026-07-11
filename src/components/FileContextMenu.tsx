// View Layer - File Context Menu Component

import { Download, Trash2, Edit, FolderOpen, FileText, Archive, Bookmark,
         Copy, Scissors, ClipboardPaste, CheckSquare, FolderInput } from 'lucide-react';
import { FtpEntry } from '@/types/ftp';
import {
  ContextMenu, ContextMenuContent, ContextMenuItem,
  ContextMenuSeparator, ContextMenuTrigger,
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
  onBookmark?: (file: FtpEntry) => void;
  onCopy?: (file: FtpEntry) => void;
  onCut?: (file: FtpEntry) => void;
  onPaste?: () => void;
  onSelectAll?: () => void;
  canEdit: boolean;
  hasClipboard?: boolean;
}

export const FileContextMenu = ({
  file, children, onDownload, onDelete, onEdit, onOpen, onProperties,
  onRename, onDownloadFolder, onBookmark, onCopy, onCut, onPaste,
  onSelectAll, canEdit, hasClipboard,
}: FileContextMenuProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56 bg-popover border-border">

        {/* Open / Edit */}
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

        {/* Clipboard */}
        {onCopy && file.name !== '..' && (
          <ContextMenuItem onClick={() => onCopy(file)} className="gap-2">
            <Copy className="h-4 w-4" />
            <span>Copy</span>
          </ContextMenuItem>
        )}
        {onCut && file.name !== '..' && (
          <ContextMenuItem onClick={() => onCut(file)} className="gap-2">
            <Scissors className="h-4 w-4" />
            <span>Move (Cut)</span>
          </ContextMenuItem>
        )}
        {onPaste && hasClipboard && (
          <ContextMenuItem onClick={onPaste} className="gap-2">
            <ClipboardPaste className="h-4 w-4" />
            <span>Paste Here</span>
          </ContextMenuItem>
        )}

        <ContextMenuSeparator />

        {/* File ops */}
        {file.name !== '..' && onRename && (
          <ContextMenuItem onClick={() => onRename(file)} className="gap-2">
            <Edit className="h-4 w-4" />
            <span>Rename</span>
          </ContextMenuItem>
        )}
        {file.isDirectory && file.name !== '..' && onBookmark && (
          <ContextMenuItem onClick={() => onBookmark(file)} className="gap-2">
            <Bookmark className="h-4 w-4" />
            <span>Bookmark Folder</span>
          </ContextMenuItem>
        )}
        {file.isDirectory && file.name !== '..' && onDownloadFolder && (
          <ContextMenuItem onClick={() => onDownloadFolder(file)} className="gap-2">
            <Archive className="h-4 w-4" />
            <span>Download as Archive</span>
          </ContextMenuItem>
        )}

        <ContextMenuSeparator />

        {/* Select */}
        {onSelectAll && (
          <ContextMenuItem onClick={onSelectAll} className="gap-2">
            <CheckSquare className="h-4 w-4" />
            <span>Select All</span>
          </ContextMenuItem>
        )}

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

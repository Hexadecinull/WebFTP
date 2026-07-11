// View Layer - Background Context Menu (right-click on empty space)

import { FilePlus, FolderPlus, Upload, RefreshCw, CheckSquare, ClipboardPaste } from 'lucide-react';
import {
  ContextMenu, ContextMenuContent, ContextMenuItem,
  ContextMenuSeparator, ContextMenuTrigger,
} from '@/components/ui/context-menu';

interface BackgroundContextMenuProps {
  children: React.ReactNode;
  onCreateFile: () => void;
  onCreateFolder: () => void;
  onUpload: () => void;
  onRefresh: () => void;
  onSelectAll?: () => void;
  onPaste?: () => void;
  hasClipboard?: boolean;
}

export const BackgroundContextMenu = ({
  children, onCreateFile, onCreateFolder, onUpload, onRefresh,
  onSelectAll, onPaste, hasClipboard,
}: BackgroundContextMenuProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56 bg-popover border-border">
        <ContextMenuItem onClick={onCreateFile} className="gap-2">
          <FilePlus className="h-4 w-4" />
          <span>Create New File</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={onCreateFolder} className="gap-2">
          <FolderPlus className="h-4 w-4" />
          <span>Create New Folder</span>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onUpload} className="gap-2">
          <Upload className="h-4 w-4" />
          <span>Upload Files</span>
        </ContextMenuItem>
        {hasClipboard && onPaste && (
          <ContextMenuItem onClick={onPaste} className="gap-2">
            <ClipboardPaste className="h-4 w-4" />
            <span>Paste</span>
          </ContextMenuItem>
        )}
        <ContextMenuSeparator />
        {onSelectAll && (
          <ContextMenuItem onClick={onSelectAll} className="gap-2">
            <CheckSquare className="h-4 w-4" />
            <span>Select All</span>
          </ContextMenuItem>
        )}
        <ContextMenuItem onClick={onRefresh} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

// View Layer - Background Context Menu (right-click on empty space)

import { FilePlus, FolderPlus, Upload, RefreshCw } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

interface BackgroundContextMenuProps {
  children: React.ReactNode;
  onCreateFile: () => void;
  onCreateFolder: () => void;
  onUpload: () => void;
  onRefresh: () => void;
}

export const BackgroundContextMenu = ({
  children,
  onCreateFile,
  onCreateFolder,
  onUpload,
  onRefresh,
}: BackgroundContextMenuProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
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
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onRefresh} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

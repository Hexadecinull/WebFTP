// Main Application - MVP Pattern Integration

import { useState, useMemo, useCallback, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { ConnectionDialog } from '@/components/ConnectionDialog';
import { FileList } from '@/components/FileList';
import { FileGrid } from '@/components/FileGrid';
import { TransferQueue } from '@/components/TransferQueue';
import { Breadcrumb } from '@/components/Breadcrumb';
import { FileEditor } from '@/components/FileEditor';
import { FileProperties } from '@/components/FileProperties';
import { Settings } from '@/components/Settings';
import { BookmarksDialog } from '@/components/BookmarksDialog';
import { RecentConnectionsDialog } from '@/components/RecentConnectionsDialog';
import { SavedConnectionsDialog } from '@/components/SavedConnectionsDialog';
import { BackgroundContextMenu } from '@/components/BackgroundContextMenu';
import { CreateFolderDialog } from '@/components/CreateFolderDialog';
import { CreateFileDialog } from '@/components/CreateFileDialog';
import { UploadDialog } from '@/components/UploadDialog';
import { RenameFolderDialog } from '@/components/RenameFolderDialog';
import { DownloadFolderDialog } from '@/components/DownloadFolderDialog';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { RefreshCw, Upload, FolderPlus, FilePlus, Trash2, Settings as SettingsIcon, List, LayoutGrid } from 'lucide-react';
import { FtpEntry, ConnectOptions } from '@/types/ftp';
import { isEditableFile } from '@/lib/fileUtils';
import logo from '@/assets/logo.png';
import { UserMenu } from '@/components/UserMenu';
import Auth from '@/pages/Auth';
import { useAuth } from '@/contexts/AuthContext';
import { useEasterEgg } from '@/hooks/useEasterEgg';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

// Model Layer
import { FtpRepositoryImpl } from '@/models/FtpRepository';
import { TransferQueueManager } from '@/models/TransferQueueManager';

// Presenter Layer
import { useFtpConnection } from '@/presenters/useFtpConnection';
import { useRemoteExplorer } from '@/presenters/useRemoteExplorer';
import { useTransferQueue } from '@/presenters/useTransferQueue';

const Index = () => {
  const { user } = useAuth();
  const { handleEmptyClick } = useEasterEgg();
  const isMobile = useIsMobile();
  
  // Initialize Model layer
  const ftpRepository = useMemo(() => new FtpRepositoryImpl(), []);
  const transferQueueManager = useMemo(() => new TransferQueueManager(), []);

  // Presenter layer hooks
  const { session, isConnecting, connect, disconnect } = useFtpConnection(ftpRepository);
  const {
    files,
    currentPath,
    isLoading,
    navigateToPath,
    navigateUp,
    refresh,
    deleteFile,
    renameFile,
    createFolder,
    readFile,
    writeFile,
  } = useRemoteExplorer(ftpRepository, session);
  const {
    transfers,
    startDownload,
    startUpload,
    pauseTransfer,
    resumeTransfer,
    cancelTransfer,
    clearCompleted,
  } = useTransferQueue(ftpRepository, transferQueueManager, session);

  // View state
  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FtpEntry>();
  const [dragActive, setDragActive] = useState(false);
  const [editingFile, setEditingFile] = useState<{ path: string; name: string; content: string } | null>(null);
  const [propertiesFile, setPropertiesFile] = useState<FtpEntry | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const [recentConnectionsOpen, setRecentConnectionsOpen] = useState(false);
  const [savedConnectionsOpen, setSavedConnectionsOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showTransferQueue, setShowTransferQueue] = useState(!isMobile);
  
  // New dialog states
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [createFileOpen, setCreateFileOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [renameFolderFile, setRenameFolderFile] = useState<FtpEntry | null>(null);
  const [downloadFolderFile, setDownloadFolderFile] = useState<FtpEntry | null>(null);

  // Drag-and-drop file moving state
  const [draggedFile, setDraggedFile] = useState<FtpEntry | null>(null);

  // Get user IP for guest recent connections
  const [userIP, setUserIP] = useState<string>('');
  
  useEffect(() => {
    if (!user) {
      fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => setUserIP(data.ip))
        .catch(() => setUserIP('unknown'));
    }
  }, [user]);

  useEffect(() => {
    if (session) {
      const storageKey = user ? 'recentConnections' : `recentConnections_${userIP}`;
      const recentConnections = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const newConnection = {
        id: Date.now().toString(),
        ...session,
        timestamp: Date.now(),
        userIP: user ? undefined : userIP,
      };
      const updated = [newConnection, ...recentConnections.filter((c: any) => c.host !== session.host)].slice(0, 10);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }
  }, [session, user, userIP]);

  // View event handlers
  const handleConnect = useCallback(async (options: ConnectOptions) => {
    await connect(options);
    setConnectionDialogOpen(false);
    setSavedConnectionsOpen(false);
    setRecentConnectionsOpen(false);
  }, [connect]);

  const handleFileClick = useCallback((file: FtpEntry) => {
    setSelectedFile(file);
  }, []);

  const handleFileDoubleClick = useCallback(async (file: FtpEntry) => {
    if (file.isDirectory) {
      navigateToPath(file.path);
      setSelectedFile(undefined);
    } else if (isEditableFile(file.name)) {
      try {
        const content = await readFile(file.path);
        setEditingFile({ path: file.path, name: file.name, content });
      } catch (error) {
        console.error('Failed to read file:', error);
      }
    }
  }, [navigateToPath, readFile]);

  const handleUploadFiles = useCallback((files: File[]) => {
    files.forEach(file => {
      const remotePath = `${currentPath}/${file.name}`.replace('//', '/');
      startUpload(file, remotePath);
    });
  }, [currentPath, startUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    // If we're doing an internal file move, ignore the upload logic
    if (draggedFile) return;
    
    const files = e.dataTransfer.files;
    if (files && session) {
      Array.from(files).forEach(file => {
        const remotePath = `${currentPath}/${file.name}`.replace('//', '/');
        startUpload(file, remotePath);
      });
    }
  }, [currentPath, startUpload, session, draggedFile]);

  const handleDeleteClick = useCallback(() => {
    if (selectedFile && selectedFile.name !== '..') {
      if (confirm(`Delete ${selectedFile.name}?`)) {
        deleteFile(selectedFile.path);
        setSelectedFile(undefined);
      }
    }
  }, [selectedFile, deleteFile]);

  const handleCreateFolder = useCallback((name: string) => {
    createFolder(name);
  }, [createFolder]);

  const handleCreateFile = useCallback(async (name: string) => {
    const filePath = `${currentPath}/${name}`.replace('//', '/');
    await writeFile(filePath, '');
    refresh();
    toast({ title: 'File Created', description: `Created file: ${name}` });
  }, [currentPath, writeFile, refresh]);

  const handleRenameFolder = useCallback(async (oldPath: string, newName: string) => {
    const parentPath = oldPath.split('/').slice(0, -1).join('/') || '/';
    const newPath = `${parentPath}/${newName}`.replace('//', '/');
    await renameFile(oldPath, newPath);
  }, [renameFile]);

  const handleDownloadFolder = useCallback((folder: FtpEntry, format: string) => {
    toast({ title: 'Download Started', description: `Downloading ${folder.name} as .${format}...` });
    startDownload(folder.path, `${folder.name}.${format}`);
  }, [startDownload]);

  const handleEditFile = useCallback(async (file: FtpEntry) => {
    if (!isEditableFile(file.name)) return;
    try {
      const content = await readFile(file.path);
      setEditingFile({ path: file.path, name: file.name, content });
    } catch (error) {
      console.error('Failed to read file:', error);
    }
  }, [readFile]);

  const handleSaveFile = useCallback(async (content: string) => {
    if (!editingFile) return;
    await writeFile(editingFile.path, content);
    setEditingFile(null);
    refresh();
  }, [editingFile, writeFile, refresh]);

  const handleDownloadFile = useCallback((file: FtpEntry) => {
    if (!file.isDirectory) {
      startDownload(file.path, file.name);
    }
  }, [startDownload]);

  const handleOpenFolder = useCallback((file: FtpEntry) => {
    if (file.isDirectory) {
      navigateToPath(file.path);
      setSelectedFile(undefined);
    }
  }, [navigateToPath]);

  const handleShowProperties = useCallback((file: FtpEntry) => {
    setPropertiesFile(file);
  }, []);

  // Drag-and-drop file move handlers
  const handleFileDragStart = useCallback((e: React.DragEvent, file: FtpEntry) => {
    setDraggedFile(file);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', file.path);
    // Style the ghost
    const el = e.currentTarget as HTMLElement;
    el.style.opacity = '0.5';
    setTimeout(() => { el.style.opacity = ''; }, 0);
  }, []);

  const handleDropOnFolder = useCallback(async (e: React.DragEvent, folder: FtpEntry) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedFile || draggedFile.path === folder.path) {
      setDraggedFile(null);
      return;
    }
    const newPath = `${folder.path}/${draggedFile.name}`.replace('//', '/');
    try {
      await renameFile(draggedFile.path, newPath);
      toast({ title: 'Moved', description: `Moved ${draggedFile.name} to ${folder.name}/` });
    } catch (error) {
      console.error('Move failed:', error);
    }
    setDraggedFile(null);
  }, [draggedFile, renameFile]);

  const commonFileProps = {
    files,
    onFileClick: handleFileClick,
    onFileDoubleClick: handleFileDoubleClick,
    onDownload: handleDownloadFile,
    onDelete: (file: FtpEntry) => {
      if (confirm(`Delete ${file.name}?`)) deleteFile(file.path);
    },
    onEdit: handleEditFile,
    onOpen: handleOpenFolder,
    onProperties: handleShowProperties,
    onRename: (file: FtpEntry) => setRenameFolderFile(file),
    onDownloadFolder: (file: FtpEntry) => setDownloadFolderFile(file),
    selectedFile,
    onDragStart: handleFileDragStart,
    onDropOnFolder: handleDropOnFolder,
  };

  const fileExplorerContent = session ? (
    viewMode === 'list' ? <FileList {...commonFileProps} /> : <FileGrid {...commonFileProps} />
  ) : (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-4">
        <div className="text-muted-foreground">
          <p className="text-lg font-medium">Not Connected</p>
          <p className="text-sm">Connect to an FTP server to get started</p>
        </div>
        <Button onClick={() => setConnectionDialogOpen(true)}>
          Connect to Server
        </Button>
      </div>
    </div>
  );

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex h-screen w-full bg-background" onClick={handleEmptyClick}>
        <AppSidebar
          onNewConnection={() => setConnectionDialogOpen(true)}
          onShowBookmarks={() => setBookmarksOpen(true)}
          onShowSavedConnections={() => setSavedConnectionsOpen(true)}
          onShowRecentConnections={() => setRecentConnectionsOpen(true)}
        />

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Header */}
          <div className="h-14 border-b border-border flex items-center justify-between px-2 sm:px-4 bg-card shrink-0">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <img src={logo} alt="WebFTP" className="h-7 w-7 sm:h-8 sm:w-8 shrink-0" />
              <h1 className="text-base sm:text-lg font-semibold truncate">WebFTP</h1>
              {session && !isMobile && (
                <span className="text-sm text-muted-foreground truncate">
                  Connected to {session.host}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {!user && (
                <Button variant="default" size="sm" onClick={() => setAuthDialogOpen(true)}>
                  Sign In
                </Button>
              )}
              
              <UserMenu />
              
              <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(true)}>
                <SettingsIcon className="h-4 w-4" />
              </Button>
              
              {session && (
                <>
                  {/* View Mode Toggle */}
                  <ToggleGroup
                    type="single"
                    value={viewMode}
                    onValueChange={(v) => v && setViewMode(v as 'list' | 'grid')}
                    className="border border-border rounded-md"
                    size="sm"
                  >
                    <ToggleGroupItem value="list" aria-label="List view" className="h-8 w-8 p-0">
                      <List className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="grid" aria-label="Grid view" className="h-8 w-8 p-0">
                      <LayoutGrid className="h-4 w-4" />
                    </ToggleGroupItem>
                  </ToggleGroup>

                  <Button variant="ghost" size="sm" onClick={refresh} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setUploadDialogOpen(true)} title="Upload Files">
                    <Upload className="h-4 w-4" />
                  </Button>
                  {!isMobile && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => setCreateFolderOpen(true)} title="Create New Folder">
                        <FolderPlus className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setCreateFileOpen(true)} title="Create New File">
                        <FilePlus className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {selectedFile && selectedFile.name !== '..' && (
                    <Button variant="ghost" size="sm" onClick={handleDeleteClick}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="destructive" size="sm" onClick={disconnect}>
                    {isMobile ? 'DC' : 'Disconnect'}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* File Explorer */}
            <div className="flex-1 flex flex-col min-w-0">
              {session && <Breadcrumb path={currentPath} onNavigate={navigateToPath} />}
              
              <div
                className={`flex-1 relative ${dragActive ? 'bg-accent/20' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!draggedFile) setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
              >
                {session ? (
                  <BackgroundContextMenu
                    onCreateFile={() => setCreateFileOpen(true)}
                    onCreateFolder={() => setCreateFolderOpen(true)}
                    onUpload={() => setUploadDialogOpen(true)}
                    onRefresh={refresh}
                  >
                    <div className="h-full">
                      {fileExplorerContent}
                    </div>
                  </BackgroundContextMenu>
                ) : (
                  fileExplorerContent
                )}

                {dragActive && session && !draggedFile && (
                  <div className="absolute inset-0 bg-accent/20 border-2 border-dashed border-primary flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <Upload className="h-12 w-12 mx-auto mb-2 text-primary" />
                      <p className="text-lg font-medium">Drop files to upload</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Transfer Queue - responsive */}
            {!isMobile && (
              <div className="w-64 lg:w-80 border-l border-border bg-card shrink-0">
                <TransferQueue
                  transfers={transfers}
                  onPause={pauseTransfer}
                  onResume={resumeTransfer}
                  onCancel={cancelTransfer}
                  onClearCompleted={clearCompleted}
                />
              </div>
            )}
          </div>
        </div>

        {/* Connection Dialog */}
        <ConnectionDialog
          open={connectionDialogOpen}
          onOpenChange={setConnectionDialogOpen}
          onConnect={handleConnect}
          isConnecting={isConnecting}
        />

        {/* File Editor */}
        {editingFile && (
          <FileEditor
            filename={editingFile.name}
            initialContent={editingFile.content}
            onSave={handleSaveFile}
            onClose={() => setEditingFile(null)}
          />
        )}

        {/* File Properties */}
        <FileProperties
          file={propertiesFile}
          open={!!propertiesFile}
          onOpenChange={(open) => !open && setPropertiesFile(null)}
        />

        {/* Settings */}
        {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}

        {/* Bookmarks */}
        <BookmarksDialog
          open={bookmarksOpen}
          onOpenChange={setBookmarksOpen}
          onNavigate={navigateToPath}
        />

        {/* Recent Connections */}
        <RecentConnectionsDialog
          open={recentConnectionsOpen}
          onOpenChange={setRecentConnectionsOpen}
          onConnect={handleConnect}
        />

        {/* Saved Connections */}
        <SavedConnectionsDialog
          open={savedConnectionsOpen}
          onOpenChange={setSavedConnectionsOpen}
          onConnect={handleConnect}
        />

        {/* Custom Dialogs */}
        <CreateFolderDialog
          open={createFolderOpen}
          onOpenChange={setCreateFolderOpen}
          onCreateFolder={handleCreateFolder}
        />
        <CreateFileDialog
          open={createFileOpen}
          onOpenChange={setCreateFileOpen}
          onCreateFile={handleCreateFile}
        />
        <UploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          onUpload={handleUploadFiles}
        />
        <RenameFolderDialog
          open={!!renameFolderFile}
          onOpenChange={(open) => !open && setRenameFolderFile(null)}
          file={renameFolderFile}
          onRename={handleRenameFolder}
        />
        <DownloadFolderDialog
          open={!!downloadFolderFile}
          onOpenChange={(open) => !open && setDownloadFolderFile(null)}
          folder={downloadFolderFile}
          onDownload={handleDownloadFolder}
        />

        {/* Auth Dialog with blur overlay */}
        {authDialogOpen && (
          <>
            <div 
              className="fixed inset-0 bg-background/80 backdrop-blur-md z-40" 
              onClick={() => setAuthDialogOpen(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="pointer-events-auto">
                <Auth onClose={() => setAuthDialogOpen(false)} />
              </div>
            </div>
          </>
        )}
      </div>
    </SidebarProvider>
  );
};

export default Index;

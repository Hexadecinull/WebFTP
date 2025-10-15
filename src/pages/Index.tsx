// Main Application - MVP Pattern Integration

import { useState, useMemo, useCallback } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { ConnectionDialog } from '@/components/ConnectionDialog';
import { FileList } from '@/components/FileList';
import { TransferQueue } from '@/components/TransferQueue';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Button } from '@/components/ui/button';
import { RefreshCw, Upload, FolderPlus, Trash2 } from 'lucide-react';
import { FtpEntry, ConnectOptions } from '@/types/ftp';

// Model Layer
import { FtpRepositoryImpl } from '@/models/FtpRepository';
import { TransferQueueManager } from '@/models/TransferQueueManager';

// Presenter Layer
import { useFtpConnection } from '@/presenters/useFtpConnection';
import { useRemoteExplorer } from '@/presenters/useRemoteExplorer';
import { useTransferQueue } from '@/presenters/useTransferQueue';

const Index = () => {
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
    createFolder,
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

  // View event handlers
  const handleConnect = useCallback(async (options: ConnectOptions) => {
    await connect(options);
    setConnectionDialogOpen(false);
  }, [connect]);

  const handleFileClick = useCallback((file: FtpEntry) => {
    setSelectedFile(file);
  }, []);

  const handleFileDoubleClick = useCallback((file: FtpEntry) => {
    if (file.isDirectory) {
      navigateToPath(file.path);
      setSelectedFile(undefined);
    } else {
      startDownload(file.path, file.name);
    }
  }, [navigateToPath, startDownload]);

  const handleUploadClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        Array.from(files).forEach(file => {
          const remotePath = `${currentPath}/${file.name}`.replace('//', '/');
          startUpload(file, remotePath);
        });
      }
    };
    input.click();
  }, [currentPath, startUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && session) {
      Array.from(files).forEach(file => {
        const remotePath = `${currentPath}/${file.name}`.replace('//', '/');
        startUpload(file, remotePath);
      });
    }
  }, [currentPath, startUpload, session]);

  const handleDeleteClick = useCallback(() => {
    if (selectedFile && selectedFile.name !== '..') {
      if (confirm(`Delete ${selectedFile.name}?`)) {
        deleteFile(selectedFile.path);
        setSelectedFile(undefined);
      }
    }
  }, [selectedFile, deleteFile]);

  const handleNewFolder = useCallback(() => {
    const name = prompt('Enter folder name:');
    if (name) {
      createFolder(name);
    }
  }, [createFolder]);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar
          onNewConnection={() => setConnectionDialogOpen(true)}
          onShowBookmarks={() => {}}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-card">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold">Remote Explorer</h1>
              {session && (
                <span className="text-sm text-muted-foreground">
                  Connected to {session.host}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {session && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refresh}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleUploadClick}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNewFolder}
                  >
                    <FolderPlus className="h-4 w-4 mr-2" />
                    New Folder
                  </Button>
                  {selectedFile && selectedFile.name !== '..' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDeleteClick}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={disconnect}
                  >
                    Disconnect
                  </Button>
                </>
              )}
              {!session && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setConnectionDialogOpen(true)}
                >
                  Connect
                </Button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* File Explorer */}
            <div className="flex-1 flex flex-col border-r border-border">
              {session && <Breadcrumb path={currentPath} onNavigate={navigateToPath} />}
              
              <div
                className={`flex-1 relative ${dragActive ? 'bg-accent/20' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
              >
                {session ? (
                  <FileList
                    files={files}
                    onFileClick={handleFileClick}
                    onFileDoubleClick={handleFileDoubleClick}
                    selectedFile={selectedFile}
                  />
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
                )}

                {dragActive && session && (
                  <div className="absolute inset-0 bg-accent/20 border-2 border-dashed border-primary flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <Upload className="h-12 w-12 mx-auto mb-2 text-primary" />
                      <p className="text-lg font-medium">Drop files to upload</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Transfer Queue */}
            <div className="w-80 border-l border-border bg-card">
              <TransferQueue
                transfers={transfers}
                onPause={pauseTransfer}
                onResume={resumeTransfer}
                onCancel={cancelTransfer}
                onClearCompleted={clearCompleted}
              />
            </div>
          </div>
        </div>

        {/* Connection Dialog */}
        <ConnectionDialog
          open={connectionDialogOpen}
          onOpenChange={setConnectionDialogOpen}
          onConnect={handleConnect}
          isConnecting={isConnecting}
        />
      </div>
    </SidebarProvider>
  );
};

export default Index;

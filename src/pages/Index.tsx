// Main Application - MVP Pattern Integration

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
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
import { saveBookmark } from '@/lib/bookmarkUtils';
import { RecentConnectionsDialog } from '@/components/RecentConnectionsDialog';
import { SavedConnectionsDialog } from '@/components/SavedConnectionsDialog';
import { BackgroundContextMenu } from '@/components/BackgroundContextMenu';
import { CreateFolderDialog } from '@/components/CreateFolderDialog';
import { CreateFileDialog } from '@/components/CreateFileDialog';
import { UploadDialog } from '@/components/UploadDialog';
import { RenameFolderDialog } from '@/components/RenameFolderDialog';
import { DownloadFolderDialog } from '@/components/DownloadFolderDialog';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { MobileWarningDialog } from '@/components/MobileWarningDialog';
import { ArchiveBrowserDialog } from '@/components/ArchiveBrowserDialog';
import { MediaViewerDialog } from '@/components/MediaViewerDialog';
import { ConsolePanel } from '@/components/ConsolePanel';
import { logEvent } from '@/lib/consoleLog';
import { StatusBar } from '@/components/StatusBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { RefreshCw, Upload, FolderPlus, FilePlus, Trash2, Settings as SettingsIcon, List, LayoutGrid, MoreHorizontal, Search, X, Keyboard, Terminal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FtpEntry, ConnectOptions } from '@/types/ftp';
import { isEditableFile, isArchiveFile, isMediaFile, isImageFile } from '@/lib/fileUtils';
import logo from '@/assets/logo.png';
import { UserMenu } from '@/components/UserMenu';
import Auth from '@/pages/Auth';
import { useAuth } from '@/contexts/AuthContext';
import { useEasterEgg } from '@/hooks/useEasterEgg';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

// Model Layer
import { FtpRepositoryImpl } from '@/models/FtpRepository';
import { FtpRepositoryRemoteImpl } from '@/models/FtpRepositoryRemoteImpl';
import { TransferQueueManager } from '@/models/TransferQueueManager';
import { useSettings } from '@/hooks/useSettings';

// Presenter Layer
import { useFtpConnection } from '@/presenters/useFtpConnection';
import { useRemoteExplorer } from '@/presenters/useRemoteExplorer';
import { useTransferQueue } from '@/presenters/useTransferQueue';

const Index = () => {
  const { user } = useAuth();
  const { handleEmptyClick } = useEasterEgg();
  const isMobile = useIsMobile();
  
  const { settings } = useSettings();

  // Pick real proxy implementation if a proxy URL is configured, otherwise use demo VFS
  const ftpRepository = useMemo(() => {
    if (settings.proxyUrl.trim()) {
      return new FtpRepositoryRemoteImpl(settings.proxyUrl.trim());
    }
    return new FtpRepositoryImpl();
  }, [settings.proxyUrl]);

  const transferQueueManager = useMemo(() => new TransferQueueManager(), []);

  // Keep queue concurrency in sync with settings
  useEffect(() => {
    transferQueueManager.setMaxConcurrent(settings.concurrentTransfers);
  }, [settings.concurrentTransfers, transferQueueManager]);

  // Presenter layer hooks
  const { session, isConnecting, connect: connectRaw, disconnect } = useFtpConnection(ftpRepository);

  // Inject persisted settings into every connect call
  const connect = useCallback(async (options: ConnectOptions) => {
    return connectRaw({
      ...options,
      timeout: settings.connectionTimeout,
      keepAlive: settings.keepAliveInterval,
      ftpPassive: options.ftpPassive ?? settings.usePassiveMode,
    });
  }, [connectRaw, settings.connectionTimeout, settings.keepAliveInterval, settings.usePassiveMode]);
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
  const [connectionPrefill, setConnectionPrefill] = useState<Partial<ConnectOptions> | undefined>(undefined);
  const [selectedFiles, setSelectedFiles] = useState<FtpEntry[]>([]);
  const [clipboard, setClipboard] = useState<{ files: FtpEntry[]; operation: 'copy' | 'move' } | null>(null);
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
  const [keyboardShortcutsOpen, setKeyboardShortcutsOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ files: FtpEntry[] } | null>(null);
  const [mobileWarningOpen, setMobileWarningOpen] = useState(false);
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [consoleDetached, setConsoleDetached] = useState(false);
  const [splitRatio, setSplitRatio] = useState(0.5);

  useEffect(() => {
    if (isMobile && !sessionStorage.getItem('mobileWarningDismissed')) {
      setMobileWarningOpen(true);
    }
  }, [isMobile]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Navigation history for back/forward
  const [navHistory, setNavHistory] = useState<string[]>(['/']);
  const [navIndex, setNavIndex] = useState(0);
  const canGoBack = navIndex > 0;
  const canGoForward = navIndex < navHistory.length - 1;

  // Inactivity timeout — disconnect after 5 minutes
  const lastActivityRef = useRef(Date.now());
  const inactivityTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const updateActivity = () => { lastActivityRef.current = Date.now(); };
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
    };
  }, []);

  useEffect(() => {
    if (session) {
      inactivityTimerRef.current = setInterval(() => {
        if (Date.now() - lastActivityRef.current > 5 * 60 * 1000) {
          disconnect();
          logEvent('warning', 'Disconnected automatically after 5 minutes of inactivity');
          toast({ title: 'Disconnected due to inactivity', description: 'You were inactive for 5 minutes.', variant: 'destructive' });
        }
      }, 30000);
    } else {
      if (inactivityTimerRef.current) clearInterval(inactivityTimerRef.current);
    }
    return () => { if (inactivityTimerRef.current) clearInterval(inactivityTimerRef.current); };
  }, [session, disconnect]);

  // New dialog states
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [createFileOpen, setCreateFileOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [renameFolderFile, setRenameFolderFile] = useState<FtpEntry | null>(null);
  const [downloadFolderFile, setDownloadFolderFile] = useState<FtpEntry | null>(null);

  // Drag-and-drop file moving state
  const [draggedFile, setDraggedFile] = useState<FtpEntry | null>(null);

  // Flag set right before a back/forward navigation so the tracking effect
  // below knows NOT to push a new history entry — it's just moving the pointer.
  const isHistoryNavRef = useRef(false);

  // Track navigation history when path changes (only for genuinely new
  // directory visits — back/forward navigation is excluded via the ref flag)
  useEffect(() => {
    if (!session) return;
    localStorage.setItem(`lastPath_${session.host}_${session.protocol}`, currentPath);
    setSelectedFiles([]);

    if (isHistoryNavRef.current) {
      isHistoryNavRef.current = false;
      return;
    }

    setNavHistory(prev => {
      const trimmed = prev.slice(0, navIndex + 1);
      if (trimmed[trimmed.length - 1] === currentPath) return prev;
      const updated = [...trimmed, currentPath];
      setNavIndex(updated.length - 1);
      return updated;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath]);

  const handleGoBack = useCallback(() => {
    if (!canGoBack) return;
    const newIndex = navIndex - 1;
    isHistoryNavRef.current = true;
    setNavIndex(newIndex);
    navigateToPath(navHistory[newIndex]);
  }, [canGoBack, navIndex, navHistory, navigateToPath]);

  const handleGoForward = useCallback(() => {
    if (!canGoForward) return;
    const newIndex = navIndex + 1;
    isHistoryNavRef.current = true;
    setNavIndex(newIndex);
    navigateToPath(navHistory[newIndex]);
  }, [canGoForward, navIndex, navHistory, navigateToPath]);

  // Save a recent connection entry whenever a new session is established.
  useEffect(() => {
    if (!session) return;
    const storageKey = user ? `recentConnections_${user.id}` : 'recentConnections_guest';
    const existing = JSON.parse(localStorage.getItem(storageKey) || '[]') as Array<{ id: string; host: string; timestamp: number }>;
    const entry = { id: Date.now().toString(), host: session.host, protocol: session.protocol, timestamp: Date.now() };
    const updated = [entry, ...existing.filter((c: { host: string }) => c.host !== session.host)].slice(0, 10);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  }, [session, user]);

  const handleDeleteClick = useCallback(() => {
    const toDelete = selectedFiles.filter(f => f.name !== '..');
    if (toDelete.length === 0) return;
    setDeleteConfirm({ files: toDelete });
  }, [selectedFiles]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!session) return;
      const tag = (e.target as HTMLElement).tagName;
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable;

      if (e.key === 'F1' || (e.key === '?' && !inInput)) { e.preventDefault(); setKeyboardShortcutsOpen(true); }
      if (e.key === 'F5') { e.preventDefault(); refresh(); }
      if (e.key === 'F2' && selectedFiles.length === 1) { e.preventDefault(); setRenameFolderFile(selectedFiles[0]); }
      if (e.key === 'Delete' && selectedFiles.length > 0 && !inInput) { e.preventDefault(); handleDeleteClick(); }
      if (e.key === 'Backspace' && !inInput) { e.preventDefault(); navigateToPath(currentPath.split('/').slice(0, -1).join('/') || '/'); }
      if (e.altKey && e.key === 'ArrowLeft') { e.preventDefault(); handleGoBack(); }
      if (e.altKey && e.key === 'ArrowRight') { e.preventDefault(); handleGoForward(); }
      if (e.ctrlKey && e.key === 'a' && !inInput) { e.preventDefault(); setSelectedFiles(files); }
      if (e.ctrlKey && e.key === 'c' && selectedFiles.length > 0 && !inInput) { e.preventDefault(); setClipboard({ files: selectedFiles, operation: 'copy' }); toast({ title: `Copied ${selectedFiles.length} item(s)` }); }
      if (e.ctrlKey && e.key === 'x' && selectedFiles.length > 0 && !inInput) { e.preventDefault(); setClipboard({ files: selectedFiles, operation: 'move' }); toast({ title: `Cut ${selectedFiles.length} item(s)` }); }
      if (e.ctrlKey && e.key === 'v' && clipboard && !inInput) { e.preventDefault(); handlePaste(); }
      if (e.ctrlKey && e.key === 'f') { e.preventDefault(); setSearchActive(true); setTimeout(() => searchInputRef.current?.focus(), 50); }
      if (e.key === 'Escape' && searchActive) { setSearchActive(false); setSearchQuery(''); }
      if (e.shiftKey && e.key === 'U' && !inInput) { e.preventDefault(); setUploadDialogOpen(true); }
      if (e.shiftKey && e.key === 'N' && !inInput) { e.preventDefault(); setCreateFileOpen(true); }
      if (e.shiftKey && e.key === 'F' && !inInput) { e.preventDefault(); setCreateFolderOpen(true); }
      if (e.shiftKey && e.key === 'D' && selectedFiles.length > 0 && !inInput) { e.preventDefault(); selectedFiles.forEach(f => { if (!f.isDirectory) startDownload(f.path, f.name); }); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [session, selectedFiles, clipboard, searchActive, files, currentPath, refresh, deleteFile, navigateToPath, handleGoBack, handleGoForward, startDownload, handleDeleteClick]);

  // View event handlers
  const handleConnect = useCallback(async (options: ConnectOptions) => {
    await connect(options);
    setConnectionDialogOpen(false);
    setSavedConnectionsOpen(false);
    setRecentConnectionsOpen(false);
    setNavHistory(['/']);
    setNavIndex(0);
  }, [connect]);

  const handleFileClick = useCallback((file: FtpEntry, ctrlKey: boolean) => {
    if (ctrlKey) {
      setSelectedFiles(prev =>
        prev.some(f => f.path === file.path)
          ? prev.filter(f => f.path !== file.path)
          : [...prev, file]
      );
    } else {
      setSelectedFiles([file]);
    }
  }, []);

  const [archiveViewer, setArchiveViewer] = useState<{ path: string; name: string } | null>(null);
  const [mediaViewer, setMediaViewer] = useState<{ path: string; name: string } | null>(null);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [mediaLoading, setMediaLoading] = useState(false);

  const handleFileDoubleClick = useCallback(async (file: FtpEntry) => {
    if (file.isDirectory) {
      navigateToPath(file.path);
      setSelectedFiles([]);
      return;
    }

    if (isArchiveFile(file.name)) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'zip') {
        toast({
          title: 'Preview not available',
          description: `Browsing ${ext?.toUpperCase()} contents isn't supported yet — only ZIP archives can be browsed. You can still download it normally.`,
        });
        return;
      }
      if (!settings.proxyUrl.trim()) {
        toast({ title: 'Proxy required', description: 'Archive browsing requires a configured proxy server (Settings → Connection).', variant: 'destructive' });
        return;
      }
      setArchiveViewer({ path: file.path, name: file.name });
      return;
    }

    if (isMediaFile(file.name)) {
      setMediaViewer({ path: file.path, name: file.name });
      setMediaBlob(null);
      setMediaLoading(true);
      try {
        const blob = await ftpRepository.download(session!, file.path);
        setMediaBlob(blob);
      } catch (error) {
        toast({ title: 'Failed to load preview', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
        setMediaViewer(null);
      } finally {
        setMediaLoading(false);
      }
      return;
    }

    if (isEditableFile(file.name)) {
      try {
        const content = await readFile(file.path);
        setEditingFile({ path: file.path, name: file.name, content });
      } catch (error) {
        console.error('Failed to read file:', error);
      }
    }
  }, [navigateToPath, readFile, settings.proxyUrl, ftpRepository, session]);

  const handlePaste = useCallback(async () => {
    if (!clipboard) return;
    for (const file of clipboard.files) {
      const destPath = `${currentPath}/${file.name}`.replace('//', '/');
      try {
        if (clipboard.operation === 'move') {
          await renameFile(file.path, destPath);
        } else {
          const content = await readFile(file.path);
          await writeFile(destPath, content);
        }
      } catch {
        toast({ title: `Failed to ${clipboard.operation} ${file.name}`, variant: 'destructive' });
      }
    }
    if (clipboard.operation === 'move') setClipboard(null);
    refresh();
  }, [clipboard, currentPath, renameFile, readFile, writeFile, refresh]);

  const handleUploadFiles = useCallback((files: File[]) => {
    const remotePath = (file: File) => `${currentPath}/${file.name}`.replace('//', '/');
    Promise.all(files.map(file => startUpload(file, remotePath(file)))).finally(() => {
      refresh();
    });
  }, [currentPath, startUpload, refresh]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    // If we're doing an internal file move, ignore the upload logic
    if (draggedFile) return;
    
    const files = e.dataTransfer.files;
    if (files && session) {
      const fileArray = Array.from(files);
      Promise.all(fileArray.map(file => {
        const remotePath = `${currentPath}/${file.name}`.replace('//', '/');
        return startUpload(file, remotePath);
      })).finally(() => refresh());
    }
  }, [currentPath, startUpload, session, draggedFile, refresh]);

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
      refresh();
    } catch (error) {
      console.error('Move failed:', error);
    }
    setDraggedFile(null);
  }, [draggedFile, renameFile, refresh]);

  // Handles dropping a dragged file onto a breadcrumb path segment (moving
  // it to that ancestor directory), matching Windows File Explorer behavior.
  const handleDropOnPath = useCallback(async (e: React.DragEvent, targetPath: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedFile) return;
    if (targetPath === currentPath) { setDraggedFile(null); return; }
    const newPath = `${targetPath}/${draggedFile.name}`.replace('//', '/');
    if (newPath === draggedFile.path) { setDraggedFile(null); return; }
    try {
      await renameFile(draggedFile.path, newPath);
      toast({ title: 'Moved', description: `Moved ${draggedFile.name} to ${targetPath === '/' ? 'root' : targetPath}` });
      refresh();
    } catch (error) {
      toast({ title: 'Move failed', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
    }
    setDraggedFile(null);
  }, [draggedFile, currentPath, renameFile, refresh]);

  const handleBookmark = useCallback((file: FtpEntry) => {
    if (!session) return;
    saveBookmark(user?.id, file.path, session.host);
    toast({ title: 'Bookmarked', description: `${file.name} added to bookmarks` });
  }, [session, user]);

  // Recursive search — searches the current directory AND all subdirectories,
  // not just the files already loaded in view. Debounced to avoid spamming
  // the server while typing.
  const [searchResults, setSearchResults] = useState<FtpEntry[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchActive || !searchQuery.trim() || !session) {
      setSearchResults(null);
      return;
    }
    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        if (ftpRepository.search) {
          const results = await ftpRepository.search(session, currentPath, searchQuery.trim());
          setSearchResults(results);
        } else {
          // Fallback: filter only the current directory if search isn't supported
          const q = searchQuery.toLowerCase();
          setSearchResults(files.filter(f => f.name.toLowerCase().includes(q)));
        }
      } catch {
        toast({ title: 'Search failed', description: 'Could not complete the search', variant: 'destructive' });
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchActive, session, currentPath, ftpRepository, files]);

  const displayedFiles = useMemo(() => {
    if (!searchActive || !searchQuery.trim()) return files;
    return searchResults ?? [];
  }, [files, searchQuery, searchActive, searchResults]);

  const commonFileProps = {
    files: displayedFiles,
    onFileClick: handleFileClick,
    onFileDoubleClick: handleFileDoubleClick,
    onDownload: handleDownloadFile,
    onDelete: (file: FtpEntry) => setDeleteConfirm({ files: [file] }),
    onEdit: handleEditFile,
    onOpen: handleOpenFolder,
    onProperties: handleShowProperties,
    onRename: (file: FtpEntry) => setRenameFolderFile(file),
    onDownloadFolder: (file: FtpEntry) => setDownloadFolderFile(file),
    onBookmark: handleBookmark,
    onCopy: (file: FtpEntry) => { setClipboard({ files: [file], operation: 'copy' }); toast({ title: `Copied ${file.name}` }); },
    onCut: (file: FtpEntry) => { setClipboard({ files: [file], operation: 'move' }); toast({ title: `Cut ${file.name}` }); },
    onPaste: handlePaste,
    onSelectAll: () => setSelectedFiles(prev => prev.length === files.length ? [] : files),
    allSelected: selectedFiles.length > 0 && selectedFiles.length === files.length,
    selectedFiles,
    hasClipboard: !!clipboard,
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
                  {/* View mode toggle — always visible */}
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

                  <Button variant="ghost" size="sm" onClick={() => setSearchActive(v => !v)} title="Search (Ctrl+F)">
                    <Search className="h-4 w-4" />
                  </Button>

                  <Button variant="ghost" size="sm" onClick={() => setKeyboardShortcutsOpen(true)} title="Keyboard shortcuts (?)">
                    <Keyboard className="h-4 w-4" />
                  </Button>

                  {!consoleOpen && !isMobile && (
                    <Button variant="ghost" size="sm" onClick={() => setConsoleOpen(true)} title="Show Console">
                      <Terminal className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Desktop: show actions inline */}
                  {!isMobile && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => setUploadDialogOpen(true)} title="Upload Files">
                        <Upload className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setCreateFolderOpen(true)} title="New Folder">
                        <FolderPlus className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setCreateFileOpen(true)} title="New File">
                        <FilePlus className="h-4 w-4" />
                      </Button>
                      {selectedFiles.some(f => f.name !== '..') && (
                        <Button variant="ghost" size="sm" onClick={handleDeleteClick}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  )}

                  {/* Mobile: collapse secondary actions into overflow menu */}
                  {isMobile && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setUploadDialogOpen(true)}>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Files
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setCreateFolderOpen(true)}>
                          <FolderPlus className="h-4 w-4 mr-2" />
                          New Folder
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setCreateFileOpen(true)}>
                          <FilePlus className="h-4 w-4 mr-2" />
                          New File
                        </DropdownMenuItem>
                        {selectedFiles.some(f => f.name !== '..') && (
                          <DropdownMenuItem onClick={handleDeleteClick} className="text-destructive focus:text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete {selectedFiles.length === 1 ? selectedFiles[0].name : `${selectedFiles.length} items`}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
              {session && (
                <Breadcrumb
                  path={currentPath}
                  onNavigate={navigateToPath}
                  canGoBack={canGoBack}
                  canGoForward={canGoForward}
                  onGoBack={handleGoBack}
                  onGoForward={handleGoForward}
                  onDropOnPath={handleDropOnPath}
                />
              )}

              {/* Search bar — shown when active (Ctrl+F) */}
              {searchActive && session && (
                <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card">
                  <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    placeholder="Search files and folders in this directory and all subdirectories…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Escape') { setSearchActive(false); setSearchQuery(''); } }}
                  />
                  {isSearching && (
                    <span className="text-xs text-muted-foreground shrink-0 animate-pulse">Searching…</span>
                  )}
                  {!isSearching && searchQuery && (
                    <span className="text-xs text-muted-foreground shrink-0">{displayedFiles.length} result{displayedFiles.length !== 1 ? 's' : ''}</span>
                  )}
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => { setSearchActive(false); setSearchQuery(''); }}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

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
                    onSelectAll={() => setSelectedFiles(files)}
                    onPaste={handlePaste}
                    hasClipboard={!!clipboard}
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
              {/* Status bar — only shown when connected */}
              {session && (
                <StatusBar
                  totalItems={displayedFiles.length}
                  selectedCount={selectedFiles.length}
                  currentPath={currentPath}
                />
              )}
            </div>

            {/* Transfer Queue + Console - responsive, resizable split.
                ConsolePanel is rendered exactly once and stays mounted;
                when its internal "detached" state flips, it switches to
                position:fixed internally and visually pops out of this
                docked slot on its own — no need to move it in the tree. */}
            {!isMobile && (
              <div className="w-64 lg:w-80 border-l border-border bg-card shrink-0 flex flex-col overflow-hidden">
                <div style={{ height: (session && consoleOpen && !consoleDetached) ? `${splitRatio * 100}%` : '100%' }} className="min-h-0 overflow-hidden">
                  <TransferQueue
                    transfers={transfers}
                    onPause={pauseTransfer}
                    onResume={resumeTransfer}
                    onCancel={cancelTransfer}
                    onClearCompleted={clearCompleted}
                  />
                </div>

                {session && consoleOpen && (
                  <>
                    {!consoleDetached && (
                      <div
                        className="h-1.5 cursor-row-resize bg-border hover:bg-primary/50 transition-colors shrink-0"
                        onPointerDown={(e) => {
                          const startY = e.clientY;
                          const startRatio = splitRatio;
                          const containerHeight = e.currentTarget.parentElement?.clientHeight || 600;
                          const onMove = (ev: PointerEvent) => {
                            const dy = ev.clientY - startY;
                            const newRatio = Math.min(0.85, Math.max(0.15, startRatio + dy / containerHeight));
                            setSplitRatio(newRatio);
                          };
                          const onUp = () => {
                            window.removeEventListener('pointermove', onMove);
                            window.removeEventListener('pointerup', onUp);
                          };
                          window.addEventListener('pointermove', onMove);
                          window.addEventListener('pointerup', onUp);
                        }}
                      />
                    )}
                    <div style={!consoleDetached ? { height: `${(1 - splitRatio) * 100}%` } : undefined} className={!consoleDetached ? 'min-h-0 overflow-hidden' : ''}>
                      <ConsolePanel
                        onClose={() => setConsoleOpen(false)}
                        onDetachChange={setConsoleDetached}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Keyboard Shortcuts Dialog */}
        <KeyboardShortcuts open={keyboardShortcutsOpen} onOpenChange={setKeyboardShortcutsOpen} />

        <MobileWarningDialog
          open={mobileWarningOpen}
          onOpenChange={(open) => {
            setMobileWarningOpen(open);
            if (!open) sessionStorage.setItem('mobileWarningDismissed', 'true');
          }}
        />

        {archiveViewer && session && (
          <ArchiveBrowserDialog
            open={!!archiveViewer}
            onOpenChange={(open) => { if (!open) setArchiveViewer(null); }}
            archivePath={archiveViewer.path}
            archiveName={archiveViewer.name}
            proxyUrl={settings.proxyUrl}
            sessionId={session.id}
          />
        )}

        {mediaViewer && (
          <MediaViewerDialog
            open={!!mediaViewer}
            onOpenChange={(open) => { if (!open) { setMediaViewer(null); setMediaBlob(null); } }}
            filename={mediaViewer.name}
            blob={mediaBlob}
            loading={mediaLoading}
            onSaveEdited={isImageFile(mediaViewer.name) ? async (blob) => {
              const file = new File([blob], mediaViewer.name, { type: blob.type });
              await ftpRepository.upload(session!, mediaViewer.path, file);
              refresh();
            } : undefined}
          />
        )}

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <DeleteConfirmDialog
            open={!!deleteConfirm}
            onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}
            itemName={deleteConfirm.files[0]?.name || ''}
            itemCount={deleteConfirm.files.length}
            onConfirm={() => {
              deleteConfirm.files.forEach(f => deleteFile(f.path));
              setSelectedFiles(prev => prev.filter(f => !deleteConfirm.files.some(d => d.path === f.path)));
              setDeleteConfirm(null);
            }}
          />
        )}

        {/* Connection Dialog */}
        <ConnectionDialog
          open={connectionDialogOpen}
          onOpenChange={setConnectionDialogOpen}
          onConnect={handleConnect}
          onSave={(options) => {
            const stored = JSON.parse(localStorage.getItem('savedConnections') || '[]');
            const entry = { ...options, id: Date.now().toString(), name: options.displayName || options.host };
            localStorage.setItem('savedConnections', JSON.stringify([...stored, entry]));
            toast({ title: 'Connection saved', description: `${entry.name} saved to connections.` });
          }}
          isConnecting={isConnecting}
          prefill={connectionPrefill}
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
          onPrefill={(partial) => {
            setConnectionPrefill(partial);
            setConnectionDialogOpen(true);
          }}
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

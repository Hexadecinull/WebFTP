// Presenter Layer - Remote Explorer Hook

import { useState, useCallback, useEffect } from 'react';
import { FtpEntry, Session } from '@/types/ftp';
import { FtpRepository } from '@/models/FtpRepository';
import { toast } from '@/hooks/use-toast';

export const useRemoteExplorer = (
  ftpRepository: FtpRepository,
  session: Session | null
) => {
  const [files, setFiles] = useState<FtpEntry[]>([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [isLoading, setIsLoading] = useState(false);

  const loadDirectory = useCallback(async (path: string) => {
    if (!session) {
      toast({
        title: 'Not Connected',
        description: 'Please connect to a server first',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const entries = await ftpRepository.list(session, path);
      setFiles(entries);
      setCurrentPath(path);
    } catch (error) {
      toast({
        title: 'Failed to List Directory',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [session, ftpRepository]);

  const navigateToPath = useCallback((path: string) => {
    loadDirectory(path);
  }, [loadDirectory]);

  const navigateUp = useCallback(() => {
    if (currentPath === '/') return;
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
    loadDirectory(parentPath);
  }, [currentPath, loadDirectory]);

  const refresh = useCallback(() => {
    loadDirectory(currentPath);
  }, [currentPath, loadDirectory]);

  const deleteFile = useCallback(async (path: string) => {
    if (!session) return;

    try {
      await ftpRepository.delete(session, path);
      toast({
        title: 'Deleted',
        description: 'File deleted successfully',
      });
      refresh();
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  }, [session, ftpRepository, refresh]);

  const renameFile = useCallback(async (oldPath: string, newPath: string) => {
    if (!session) return;

    try {
      await ftpRepository.rename(session, oldPath, newPath);
      toast({
        title: 'Renamed',
        description: 'File renamed successfully',
      });
      refresh();
    } catch (error) {
      toast({
        title: 'Rename Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  }, [session, ftpRepository, refresh]);

  const createFolder = useCallback(async (name: string) => {
    if (!session) return;

    const newPath = `${currentPath}/${name}`.replace('//', '/');
    try {
      await ftpRepository.mkdir(session, newPath);
      toast({
        title: 'Folder Created',
        description: `Created folder: ${name}`,
      });
      refresh();
    } catch (error) {
      toast({
        title: 'Create Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  }, [session, currentPath, ftpRepository, refresh]);

  const readFile = useCallback(async (path: string): Promise<string> => {
    if (!session) throw new Error('Not connected');
    return await ftpRepository.readFile(session, path);
  }, [session, ftpRepository]);

  const writeFile = useCallback(async (path: string, content: string) => {
    if (!session) return;

    try {
      await ftpRepository.writeFile(session, path, content);
      toast({
        title: 'File Saved',
        description: 'File saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  }, [session, ftpRepository]);

  // Load directory when session changes — resumes at the last visited path
  // for this host/protocol if one was saved, otherwise starts at root.
  useEffect(() => {
    if (session) {
      const lastPath = localStorage.getItem(`lastPath_${session.host}_${session.protocol}`);
      loadDirectory(lastPath || '/');
    } else {
      setFiles([]);
      setCurrentPath('/');
    }
  }, [session, loadDirectory]);

  return {
    files,
    currentPath,
    isLoading,
    loadDirectory,
    navigateToPath,
    navigateUp,
    refresh,
    deleteFile,
    renameFile,
    createFolder,
    readFile,
    writeFile,
  };
};

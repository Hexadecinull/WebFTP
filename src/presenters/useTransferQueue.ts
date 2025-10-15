// Presenter Layer - Transfer Queue Hook

import { useState, useEffect, useCallback } from 'react';
import { Transfer, Session } from '@/types/ftp';
import { FtpRepository } from '@/models/FtpRepository';
import { TransferQueueManager } from '@/models/TransferQueueManager';
import { toast } from '@/hooks/use-toast';

export const useTransferQueue = (
  ftpRepository: FtpRepository,
  transferQueue: TransferQueueManager,
  session: Session | null
) => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);

  useEffect(() => {
    const unsubscribe = transferQueue.subscribe(setTransfers);
    return unsubscribe;
  }, [transferQueue]);

  const startDownload = useCallback(async (remotePath: string, fileName: string) => {
    if (!session) {
      toast({
        title: 'Not Connected',
        description: 'Please connect to a server first',
        variant: 'destructive',
      });
      return;
    }

    const transfer = transferQueue.addTransfer({
      type: 'download',
      fileName,
      localPath: fileName,
      remotePath,
    });

    try {
      const blob = await ftpRepository.download(
        session,
        remotePath,
        (loaded, total) => {
          const progress = total ? Math.round((loaded / total) * 100) : 0;
          transferQueue.updateTransfer(transfer.id, { progress });
        }
      );

      // Trigger browser download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      transferQueue.updateTransfer(transfer.id, {
        status: 'completed',
        progress: 100,
        completedAt: new Date(),
      });

      toast({
        title: 'Download Complete',
        description: `Downloaded: ${fileName}`,
      });
    } catch (error) {
      transferQueue.updateTransfer(transfer.id, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      toast({
        title: 'Download Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  }, [session, ftpRepository, transferQueue]);

  const startUpload = useCallback(async (file: File, remotePath: string) => {
    if (!session) {
      toast({
        title: 'Not Connected',
        description: 'Please connect to a server first',
        variant: 'destructive',
      });
      return;
    }

    const transfer = transferQueue.addTransfer({
      type: 'upload',
      fileName: file.name,
      localPath: file.name,
      remotePath,
      size: file.size,
    });

    try {
      await ftpRepository.upload(
        session,
        remotePath,
        file,
        (loaded, total) => {
          const progress = total ? Math.round((loaded / total) * 100) : 0;
          transferQueue.updateTransfer(transfer.id, { progress });
        }
      );

      transferQueue.updateTransfer(transfer.id, {
        status: 'completed',
        progress: 100,
        completedAt: new Date(),
      });

      toast({
        title: 'Upload Complete',
        description: `Uploaded: ${file.name}`,
      });
    } catch (error) {
      transferQueue.updateTransfer(transfer.id, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  }, [session, ftpRepository, transferQueue]);

  const pauseTransfer = useCallback((id: string) => {
    transferQueue.pauseTransfer(id);
  }, [transferQueue]);

  const resumeTransfer = useCallback((id: string) => {
    transferQueue.resumeTransfer(id);
  }, [transferQueue]);

  const cancelTransfer = useCallback((id: string) => {
    transferQueue.cancelTransfer(id);
  }, [transferQueue]);

  const clearCompleted = useCallback(() => {
    transfers
      .filter(t => t.status === 'completed' || t.status === 'failed')
      .forEach(t => transferQueue.cancelTransfer(t.id));
  }, [transfers, transferQueue]);

  return {
    transfers,
    startDownload,
    startUpload,
    pauseTransfer,
    resumeTransfer,
    cancelTransfer,
    clearCompleted,
  };
};

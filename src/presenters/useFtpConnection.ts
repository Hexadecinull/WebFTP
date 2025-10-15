// Presenter Layer - FTP Connection Hook

import { useState, useCallback } from 'react';
import { ConnectOptions, Session } from '@/types/ftp';
import { FtpRepository } from '@/models/FtpRepository';
import { toast } from '@/hooks/use-toast';

export const useFtpConnection = (ftpRepository: FtpRepository) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(async (options: ConnectOptions) => {
    setIsConnecting(true);
    try {
      const newSession = await ftpRepository.connect(options);
      setSession(newSession);
      toast({
        title: 'Connected',
        description: `Successfully connected to ${options.host}`,
      });
      return newSession;
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect to server',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [ftpRepository]);

  const disconnect = useCallback(async () => {
    if (!session) return;
    
    try {
      await ftpRepository.disconnect(session);
      setSession(null);
      toast({
        title: 'Disconnected',
        description: 'Disconnected from server',
      });
    } catch (error) {
      toast({
        title: 'Disconnect Failed',
        description: error instanceof Error ? error.message : 'Failed to disconnect',
        variant: 'destructive',
      });
    }
  }, [session, ftpRepository]);

  return {
    session,
    isConnecting,
    connect,
    disconnect,
  };
};

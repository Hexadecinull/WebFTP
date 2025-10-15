// View Layer - Transfer Queue Component

import { Download, Upload, X, Pause, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { Transfer } from '@/types/ftp';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatBytes } from '@/lib/fileUtils';

interface TransferQueueProps {
  transfers: Transfer[];
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
  onClearCompleted: () => void;
}

export const TransferQueue = ({
  transfers,
  onPause,
  onResume,
  onCancel,
  onClearCompleted,
}: TransferQueueProps) => {
  const activeTransfers = transfers.filter(
    t => t.status === 'active' || t.status === 'pending' || t.status === 'paused'
  );
  const completedTransfers = transfers.filter(
    t => t.status === 'completed' || t.status === 'failed'
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold">Transfer Queue</h3>
        {completedTransfers.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearCompleted}
          >
            Clear Completed
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {transfers.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No active transfers
            </div>
          )}

          {transfers.map((transfer) => (
            <div
              key={transfer.id}
              className="border border-border rounded-lg p-3 space-y-2 bg-card"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {transfer.type === 'download' ? (
                    <Download className="h-4 w-4 text-primary" />
                  ) : (
                    <Upload className="h-4 w-4 text-accent" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{transfer.fileName}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {transfer.remotePath}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {transfer.status === 'active' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onPause(transfer.id)}
                    >
                      <Pause className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {transfer.status === 'paused' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onResume(transfer.id)}
                    >
                      <Play className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {transfer.status !== 'completed' && transfer.status !== 'failed' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onCancel(transfer.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {transfer.status === 'completed' && (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  )}
                  {transfer.status === 'failed' && (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  )}
                </div>
              </div>

              {transfer.status !== 'completed' && transfer.status !== 'failed' && (
                <>
                  <Progress value={transfer.progress} className="h-1.5" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{transfer.progress}%</span>
                    {transfer.size && (
                      <span>{formatBytes(transfer.size)}</span>
                    )}
                  </div>
                </>
              )}

              {transfer.status === 'failed' && transfer.error && (
                <p className="text-xs text-destructive">{transfer.error}</p>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

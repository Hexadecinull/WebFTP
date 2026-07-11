// View Layer - Transfer Queue Component

import { useRef, useEffect, useState } from 'react';
import { Download, Upload, X, Pause, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { Transfer } from '@/types/ftp';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatBytes } from '@/lib/fileUtils';

// Scrolling text component — only animates when text actually overflows the container
function ScrollingText({ text, className = '' }: { text: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;
    setShouldScroll(textEl.scrollWidth > container.clientWidth);
  }, [text]);

  return (
    <div ref={containerRef} className={`overflow-hidden whitespace-nowrap ${className}`} title={text}>
      <span
        ref={textRef}
        className={shouldScroll ? 'inline-block animate-marquee' : 'inline-block'}
      >
        {text}
        {shouldScroll && <span className="px-8">{text}</span>}
      </span>
    </div>
  );
}

interface TransferQueueProps {
  transfers: Transfer[];
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
  onClearCompleted: () => void;
}

export const TransferQueue = ({ transfers, onPause, onResume, onCancel, onClearCompleted }: TransferQueueProps) => {
  const activeTransfers = transfers.filter(t => t.status === 'active' || t.status === 'pending' || t.status === 'paused');
  const completedTransfers = transfers.filter(t => t.status === 'completed' || t.status === 'failed');

  const statusColor = (status: Transfer['status']) => {
    switch (status) {
      case 'active': return 'text-primary';
      case 'paused': return 'text-warning';
      case 'failed': return 'text-destructive';
      case 'completed': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Transfer Queue</h3>
          {activeTransfers.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
              {activeTransfers.length}
            </span>
          )}
        </div>
        {completedTransfers.length > 0 && (
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={onClearCompleted}>
            Clear
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {transfers.length === 0 && (
            <div className="text-center text-muted-foreground py-8 text-sm">
              No transfers
            </div>
          )}

          {transfers.map((transfer) => (
            <div key={transfer.id} className="border border-border rounded-lg p-3 space-y-2 bg-card">
              <div className="flex items-start gap-2">
                <div className="shrink-0 mt-0.5">
                  {transfer.type === 'download'
                    ? <Download className="h-3.5 w-3.5 text-primary" />
                    : <Upload className="h-3.5 w-3.5 text-accent" />}
                </div>

                <div className="flex-1 min-w-0">
                  <ScrollingText text={transfer.fileName} className="font-medium text-sm" />
                  <ScrollingText text={transfer.remotePath} className={`text-xs mt-0.5 font-mono ${statusColor(transfer.status)}`} />
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {transfer.status === 'active' && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onPause(transfer.id)}>
                      <Pause className="h-3 w-3" />
                    </Button>
                  )}
                  {transfer.status === 'paused' && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onResume(transfer.id)}>
                      <Play className="h-3 w-3" />
                    </Button>
                  )}
                  {transfer.status !== 'completed' && transfer.status !== 'failed' && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onCancel(transfer.id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  {transfer.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-success" />}
                  {transfer.status === 'failed' && <AlertCircle className="h-4 w-4 text-destructive" />}
                </div>
              </div>

              {(transfer.status === 'active' || transfer.status === 'pending' || transfer.status === 'paused') && (
                <>
                  <Progress value={transfer.progress} className="h-1" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{transfer.progress}%</span>
                    {transfer.size && <span>{formatBytes(transfer.size)}</span>}
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

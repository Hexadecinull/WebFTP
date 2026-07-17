// View Layer - Console Panel
// Shows a live, color-coded feed of every server interaction (connect,
// list, upload, download, rename, delete, etc.), similar to FileZilla's
// message log. Can be minimized, detached into a floating draggable/
// resizable window, or closed entirely (restored via a toolbar button).

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Terminal, Maximize2, Minimize2, X, Trash2, Pin, PinOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LogEntry, subscribeToLog, getLogEntries, clearLog } from '@/lib/consoleLog';

interface ConsolePanelProps {
  onClose: () => void;
  onDetachChange?: (detached: boolean) => void;
}

const LEVEL_STYLES: Record<LogEntry['level'], { color: string; label: string }> = {
  info: { color: 'text-muted-foreground', label: 'INFO' },
  request: { color: 'text-primary', label: 'SENT' },
  success: { color: 'text-success', label: 'OK' },
  error: { color: 'text-destructive', label: 'ERROR' },
  warning: { color: 'text-warning', label: 'WARN' },
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour12: false }) + '.' + String(d.getMilliseconds()).padStart(3, '0');
}

export const ConsolePanel = ({ onClose, onDetachChange }: ConsolePanelProps) => {
  const [entries, setEntries] = useState<LogEntry[]>(getLogEntries());
  const [minimized, setMinimized] = useState(false);
  const [detached, setDetached] = useState(false);
  const [pos, setPos] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 480, height: 340 });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const resizeState = useRef<{ startX: number; startY: number; origW: number; origH: number } | null>(null);

  useEffect(() => subscribeToLog(setEntries), []);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const viewport = scrollContainerRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [entries]);

  const handleDetach = () => {
    const next = !detached;
    setDetached(next);
    onDetachChange?.(next);
  };

  const handleDragStart = useCallback((e: React.PointerEvent) => {
    dragState.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
    const onMove = (ev: PointerEvent) => {
      if (!dragState.current) return;
      const dx = ev.clientX - dragState.current.startX;
      const dy = ev.clientY - dragState.current.startY;
      setPos({ x: dragState.current.origX + dx, y: dragState.current.origY + dy });
    };
    const onUp = () => {
      dragState.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [pos]);

  const handleResizeStart = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    resizeState.current = { startX: e.clientX, startY: e.clientY, origW: size.width, origH: size.height };
    const onMove = (ev: PointerEvent) => {
      if (!resizeState.current) return;
      const dw = ev.clientX - resizeState.current.startX;
      const dh = ev.clientY - resizeState.current.startY;
      setSize({
        width: Math.max(320, resizeState.current.origW + dw),
        height: Math.max(200, resizeState.current.origH + dh),
      });
    };
    const onUp = () => {
      resizeState.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [size]);

  const logList = (
    <ScrollArea className="flex-1" ref={scrollContainerRef}>
      <div className="p-2 space-y-0.5 font-mono text-xs">
        {entries.length === 0 && (
          <p className="text-muted-foreground text-center py-6">No activity yet — connect to a server to see logs here</p>
        )}
        {entries.map((entry) => {
          const style = LEVEL_STYLES[entry.level];
          return (
            <div key={entry.id} className="flex gap-2 items-start leading-relaxed">
              <span className="text-muted-foreground/50 shrink-0">{formatTime(entry.timestamp)}</span>
              <span className={`shrink-0 font-semibold w-14 ${style.color}`}>{style.label}</span>
              <span className={`break-all ${style.color}`}>{entry.message}</span>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );

  const header = (
    <div
      className={`flex items-center justify-between px-3 py-2 border-b border-border shrink-0 ${detached ? 'cursor-move bg-card' : ''}`}
      onPointerDown={detached ? handleDragStart : undefined}
    >
      <div className="flex items-center gap-2">
        <Terminal className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm">Console</h3>
        {entries.length > 0 && (
          <span className="px-1.5 py-0.5 text-xs bg-muted rounded-full text-muted-foreground">{entries.length}</span>
        )}
      </div>
      <div className="flex items-center gap-0.5">
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={clearLog} title="Clear log">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleDetach} title={detached ? 'Dock' : 'Detach'}>
          {detached ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setMinimized(m => !m)} title={minimized ? 'Expand' : 'Minimize'}>
          {minimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose} title="Close">
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );

  if (detached) {
    return (
      <div
        className="fixed z-50 flex flex-col bg-card border border-border rounded-lg shadow-2xl overflow-hidden"
        style={{ left: pos.x, top: pos.y, width: size.width, height: minimized ? 'auto' : size.height }}
      >
        {header}
        {!minimized && logList}
        {!minimized && (
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
            onPointerDown={handleResizeStart}
          >
            <svg viewBox="0 0 16 16" className="w-full h-full text-muted-foreground/40">
              <path d="M14 2L2 14M14 8L8 14" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border-t border-border">
      {header}
      {!minimized && logList}
    </div>
  );
};

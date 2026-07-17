// Shared console log store — simple pub-sub so any part of the app
// (repository implementations, presenters) can push log entries that the
// ConsolePanel component subscribes to and renders in real time.

export type LogLevel = 'info' | 'request' | 'success' | 'error' | 'warning';

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
}

const MAX_LOG_ENTRIES = 500;
let entries: LogEntry[] = [];
const listeners = new Set<(entries: LogEntry[]) => void>();

function notify() {
  for (const listener of listeners) listener(entries);
}

export function logEvent(level: LogLevel, message: string): void {
  const entry: LogEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    timestamp: Date.now(),
    level,
    message,
  };
  entries = [...entries.slice(-(MAX_LOG_ENTRIES - 1)), entry];
  notify();
}

export function clearLog(): void {
  entries = [];
  notify();
}

export function getLogEntries(): LogEntry[] {
  return entries;
}

export function subscribeToLog(listener: (entries: LogEntry[]) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

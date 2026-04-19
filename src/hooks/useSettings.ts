// Single source of truth for all persisted application settings.
// All reads and writes to localStorage for settings go through this hook.

import { useState, useCallback, useEffect } from 'react';

export interface AppSettings {
  // Connection
  proxyUrl: string;
  connectionTimeout: number;
  keepAliveInterval: number;
  // Transfers
  concurrentTransfers: number;
  autoRetry: boolean;
  bufferSize: number;
  // FTP
  usePassiveMode: boolean;
  enableLogging: boolean;
  // Theme (read-only here — managed by ThemeContext, listed for completeness)
}

const DEFAULTS: AppSettings = {
  proxyUrl: '',
  connectionTimeout: 30,
  keepAliveInterval: 60,
  concurrentTransfers: 3,
  autoRetry: true,
  bufferSize: 8192,
  usePassiveMode: true,
  enableLogging: false,
};

function readSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
  const raw = localStorage.getItem(key);
  if (raw === null) return DEFAULTS[key];
  const def = DEFAULTS[key];
  if (typeof def === 'boolean') return (raw === 'true') as AppSettings[K];
  if (typeof def === 'number') {
    const n = parseFloat(raw);
    return (isNaN(n) ? def : n) as AppSettings[K];
  }
  return raw as AppSettings[K];
}

export function useSettings() {
  const [settings, setSettingsState] = useState<AppSettings>(() => ({
    proxyUrl: readSetting('proxyUrl'),
    connectionTimeout: readSetting('connectionTimeout'),
    keepAliveInterval: readSetting('keepAliveInterval'),
    concurrentTransfers: readSetting('concurrentTransfers'),
    autoRetry: readSetting('autoRetry'),
    bufferSize: readSetting('bufferSize'),
    usePassiveMode: readSetting('usePassiveMode'),
    enableLogging: readSetting('enableLogging'),
  }));

  const setSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    localStorage.setItem(key, String(value));
    setSettingsState(prev => ({ ...prev, [key]: value }));
  }, []);

  // Sync across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key && e.key in DEFAULTS) {
        const k = e.key as keyof AppSettings;
        setSettingsState(prev => ({ ...prev, [k]: readSetting(k) }));
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return { settings, setSetting };
}

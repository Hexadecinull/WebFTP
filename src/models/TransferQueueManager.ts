// Model Layer - Transfer Queue Manager

import { Transfer } from '@/types/ftp';

export type TransferListener = (transfers: Transfer[]) => void;

export class TransferQueueManager {
  private transfers: Transfer[] = [];
  private listeners: TransferListener[] = [];
  private maxConcurrent = 3;
  private activeCount = 0;

  setMaxConcurrent(n: number) {
    this.maxConcurrent = Math.max(1, n);
    this.processQueue();
  }

  addTransfer(transfer: Omit<Transfer, 'id' | 'progress' | 'status'>): Transfer {
    const newTransfer: Transfer = {
      ...transfer,
      id: Math.random().toString(36).substring(7),
      progress: 0,
      status: 'pending',
    };
    
    this.transfers.push(newTransfer);
    this.notifyListeners();
    this.processQueue();
    return newTransfer;
  }

  updateTransfer(id: string, updates: Partial<Transfer>): void {
    const index = this.transfers.findIndex(t => t.id === id);
    if (index !== -1) {
      this.transfers[index] = { ...this.transfers[index], ...updates };
      this.notifyListeners();
      
      if (updates.status === 'completed' || updates.status === 'failed') {
        this.activeCount--;
        this.processQueue();
      }
    }
  }

  pauseTransfer(id: string): void {
    this.updateTransfer(id, { status: 'paused' });
    this.activeCount--;
    this.processQueue();
  }

  resumeTransfer(id: string): void {
    this.updateTransfer(id, { status: 'pending' });
    this.processQueue();
  }

  cancelTransfer(id: string): void {
    const index = this.transfers.findIndex(t => t.id === id);
    if (index !== -1) {
      const transfer = this.transfers[index];
      if (transfer.status === 'active') {
        this.activeCount--;
      }
      this.transfers.splice(index, 1);
      this.notifyListeners();
      this.processQueue();
    }
  }

  getTransfers(): Transfer[] {
    return [...this.transfers];
  }

  subscribe(listener: TransferListener): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private processQueue(): void {
    const pending = this.transfers.filter(t => t.status === 'pending');
    
    while (this.activeCount < this.maxConcurrent && pending.length > 0) {
      const transfer = pending.shift()!;
      this.updateTransfer(transfer.id, { status: 'active', startedAt: new Date() });
      this.activeCount++;
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getTransfers()));
  }

  clear(): void {
    this.transfers = [];
    this.activeCount = 0;
    this.notifyListeners();
  }
}

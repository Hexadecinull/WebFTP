// View Layer - Keyboard Shortcuts Dialog

import { Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface KeyboardShortcutsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const Kbd = ({ keys }: { keys: string[] }) => (
  <div className="flex items-center gap-1">
    {keys.map((k, i) => (
      <span key={i} className="flex items-center gap-1">
        {i > 0 && <span className="text-muted-foreground text-xs">+</span>}
        <kbd className="px-1.5 py-0.5 text-xs border border-border rounded bg-muted font-mono">{k}</kbd>
      </span>
    ))}
  </div>
);

const Row = ({ keys, description }: { keys: string[]; description: string }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
    <span className="text-sm text-muted-foreground">{description}</span>
    <Kbd keys={keys} />
  </div>
);

export const KeyboardShortcuts = ({ open, onOpenChange }: KeyboardShortcutsProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>All available keyboard shortcuts in WebFTP.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">⊕ Navigation</p>
            <Row keys={['↑', '↓']} description="Navigate files" />
            <Row keys={['←']} description="Collapse folder / Parent" />
            <Row keys={['→']} description="Expand folder" />
            <Row keys={['Enter']} description="Open folder / Edit file" />
            <Row keys={['Backspace']} description="Go to parent folder" />
            <Row keys={['Home']} description="First item" />
            <Row keys={['End']} description="Last item" />
            <Row keys={['Alt', '←']} description="Go back" />
            <Row keys={['Alt', '→']} description="Go forward" />

            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 mt-4">☑ Selection</p>
            <Row keys={['Ctrl', 'Click']} description="Multi-select" />
            <Row keys={['Space']} description="Toggle selection" />
            <Row keys={['Ctrl', 'A']} description="Select / Deselect all" />

            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 mt-4">📋 Clipboard</p>
            <Row keys={['Ctrl', 'C']} description="Copy selected" />
            <Row keys={['Ctrl', 'X']} description="Move (Cut) selected" />
            <Row keys={['Ctrl', 'V']} description="Paste" />
          </div>

          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">⚡ Actions</p>
            <Row keys={['Shift', 'U']} description="Upload files" />
            <Row keys={['Shift', 'N']} description="New file" />
            <Row keys={['Shift', 'F']} description="New folder" />
            <Row keys={['Shift', 'E']} description="Edit file" />
            <Row keys={['Shift', 'D']} description="Download" />
            <Row keys={['Delete']} description="Delete selected" />
            <Row keys={['F2']} description="Rename" />
            <Row keys={['F5']} description="Refresh" />

            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 mt-4">⚙ Other</p>
            <Row keys={['Ctrl', 'F']} description="Search files" />
            <Row keys={['/']} description="Focus search" />
            <Row keys={['?']} description="Show this help" />
            <Row keys={['Esc']} description="Close dialog / Cancel" />
            <Row keys={['Ctrl', 'S']} description="Save (in editor)" />
            <Row keys={['Shift', 'F10']} description="Context menu" />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={() => onOpenChange(false)}>Got it</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

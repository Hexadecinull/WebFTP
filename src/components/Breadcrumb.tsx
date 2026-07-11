// View Layer - Breadcrumb / Path Bar Component

import { useState, useRef, useEffect } from 'react';
import { ChevronRight, Home, ChevronLeft, ChevronRight as ChevronFwd } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface BreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
  canGoBack: boolean;
  canGoForward: boolean;
  onGoBack: () => void;
  onGoForward: () => void;
}

export const Breadcrumb = ({ path, onNavigate, canGoBack, canGoForward, onGoBack, onGoForward }: BreadcrumbProps) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(path);
  const inputRef = useRef<HTMLInputElement>(null);
  const segments = path.split('/').filter(Boolean);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.value = path;
      inputRef.current.select();
    }
  }, [editing, path]);

  const buildPath = (index: number): string => {
    if (index === -1) return '/';
    return '/' + segments.slice(0, index + 1).join('/');
  };

  const handleEditSubmit = () => {
    const trimmed = editValue.trim() || '/';
    const normalized = trimmed.startsWith('/') ? trimmed : '/' + trimmed;
    onNavigate(normalized);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleEditSubmit();
    if (e.key === 'Escape') setEditing(false);
  };

  return (
    <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border bg-card">
      {/* Back / Forward */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={onGoBack}
        disabled={!canGoBack}
        title="Back"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={onGoForward}
        disabled={!canGoForward}
        title="Forward"
      >
        <ChevronFwd className="h-4 w-4" />
      </Button>

      {/* Home */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={() => onNavigate('/')}
        title="Home"
      >
        <Home className="h-3.5 w-3.5" />
      </Button>

      {/* Editable path / breadcrumb display */}
      {editing ? (
        <Input
          ref={inputRef}
          className="h-7 text-xs font-mono flex-1 min-w-0"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleEditSubmit}
          autoFocus
        />
      ) : (
        <div
          className="flex items-center gap-0.5 flex-1 min-w-0 cursor-text rounded px-1 py-0.5 hover:bg-accent/30 transition-colors"
          onClick={() => { setEditValue(path); setEditing(true); }}
          title="Click to edit path"
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-1.5 text-xs font-mono shrink-0"
            onClick={(e) => { e.stopPropagation(); onNavigate('/'); }}
          >
            /
          </Button>
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-0.5 min-w-0">
              <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-1.5 text-xs font-mono max-w-[120px] truncate"
                onClick={(e) => { e.stopPropagation(); onNavigate(buildPath(index)); }}
                title={segment}
              >
                {segment}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

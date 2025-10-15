// View Layer - File Editor Component

import { useState, useEffect } from 'react';
import { X, Save, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';

interface FileEditorProps {
  filename: string;
  initialContent: string;
  onSave: (content: string) => Promise<void>;
  onClose: () => void;
}

export const FileEditor = ({
  filename,
  initialContent,
  onSave,
  onClose,
}: FileEditorProps) => {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setHasChanges(content !== initialContent);
  }, [content, initialContent]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(content);
      toast({
        title: 'Saved',
        description: 'File saved successfully',
      });
      setHasChanges(false);
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-fade-in">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-card">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">{filename}</h2>
            {hasChanges && (
              <span className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground">
                Modified
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 p-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="h-full font-mono text-sm resize-none"
            placeholder="File content..."
          />
        </div>
      </div>
    </div>
  );
};

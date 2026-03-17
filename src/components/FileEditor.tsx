// View Layer - File Editor Component with Syntax Highlighting

import { useState, useEffect, useMemo } from 'react';
import { X, Save, Download, Code, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import CodeMirror from '@uiw/react-codemirror';
import { getLanguageExtension } from '@/lib/editorLanguages';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { useTheme } from '@/contexts/ThemeContext';
import ReactMarkdown from 'react-markdown';

interface FileEditorProps {
  filename: string;
  initialContent: string;
  onSave: (content: string) => Promise<void>;
  onClose: () => void;
}

const isMarkdownFile = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext === 'md' || ext === 'markdown' || ext === 'mdx';
};

export const FileEditor = ({
  filename,
  initialContent,
  onSave,
  onClose,
}: FileEditorProps) => {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [mdView, setMdView] = useState<'code' | 'preview'>('code');
  const { theme } = useTheme();

  const isMarkdown = useMemo(() => isMarkdownFile(filename), [filename]);

  useEffect(() => {
    setHasChanges(content !== initialContent);
  }, [content, initialContent]);

  const languageExtension = getLanguageExtension(filename);

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
            {isMarkdown && (
              <div className="flex items-center rounded-md border border-border overflow-hidden ml-2">
                <button
                  onClick={() => setMdView('code')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                    mdView === 'code'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  <Code className="h-3.5 w-3.5" />
                  Code
                </button>
                <button
                  onClick={() => setMdView('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors border-l border-border ${
                    mdView === 'preview'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </button>
              </div>
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

        {/* Editor / Preview */}
        <div className="flex-1 overflow-hidden">
          {isMarkdown && mdView === 'preview' ? (
            <div className="h-full overflow-auto p-6 prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : (
            <CodeMirror
              value={content}
              height="100%"
              theme={theme === 'dark' ? oneDark : undefined}
              extensions={languageExtension ? [languageExtension, EditorView.lineWrapping] : [EditorView.lineWrapping]}
              onChange={(value) => setContent(value)}
              basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                highlightSpecialChars: true,
                foldGutter: true,
                drawSelection: true,
                dropCursor: true,
                allowMultipleSelections: true,
                indentOnInput: true,
                syntaxHighlighting: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                rectangularSelection: true,
                crosshairCursor: true,
                highlightActiveLine: true,
                highlightSelectionMatches: true,
                closeBracketsKeymap: true,
                searchKeymap: true,
                foldKeymap: true,
                completionKeymap: true,
                lintKeymap: true,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

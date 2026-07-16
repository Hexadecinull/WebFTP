// View Layer - Media Viewer Dialog
// Handles images (with basic editing: rotate, brightness, contrast, save-as-copy),
// video, and audio playback. Full non-destructive video/audio editing is out of
// scope for an in-browser tool — this provides solid playback plus light image editing.

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Download, RotateCw, RotateCcw, Sun, Contrast, Save, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { isImageFile, isVideoFile, isAudioFile } from '@/lib/fileUtils';
import { toast } from '@/hooks/use-toast';

interface MediaViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filename: string;
  blob: Blob | null;
  loading: boolean;
  onSaveEdited?: (blob: Blob) => Promise<void>;
}

export const MediaViewerDialog = ({ open, onOpenChange, filename, blob, loading, onSaveEdited }: MediaViewerDialogProps) => {
  const [url, setUrl] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const isImage = isImageFile(filename);
  const isVideo = isVideoFile(filename);
  const isAudio = isAudioFile(filename);

  useEffect(() => {
    if (blob) {
      const objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setUrl(null);
  }, [blob]);

  useEffect(() => {
    if (!open) {
      setRotation(0);
      setBrightness(100);
      setContrast(100);
    }
  }, [open]);

  const hasEdits = rotation !== 0 || brightness !== 100 || contrast !== 100;

  const renderToCanvas = useCallback((): HTMLCanvasElement | null => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return null;

    const swap = rotation % 180 !== 0;
    canvas.width = swap ? img.naturalHeight : img.naturalWidth;
    canvas.height = swap ? img.naturalWidth : img.naturalHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();

    return canvas;
  }, [rotation, brightness, contrast]);

  const handleDownloadEdited = () => {
    const canvas = renderToCanvas();
    if (!canvas) return;
    canvas.toBlob((editedBlob) => {
      if (!editedBlob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(editedBlob);
      a.download = `edited-${filename}`;
      a.click();
      URL.revokeObjectURL(a.href);
    });
  };

  const handleSaveToServer = async () => {
    if (!onSaveEdited) return;
    const canvas = renderToCanvas();
    if (!canvas) return;
    setSaving(true);
    canvas.toBlob(async (editedBlob) => {
      if (!editedBlob) { setSaving(false); return; }
      try {
        await onSaveEdited(editedBlob);
        toast({ title: 'Saved', description: `${filename} updated on the server` });
        onOpenChange(false);
      } catch {
        toast({ title: 'Save failed', description: 'Could not save changes to the server', variant: 'destructive' });
      } finally {
        setSaving(false);
      }
    });
  };

  const handleDownloadOriginal = () => {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="truncate pr-8">{filename}</DialogTitle>
          <DialogDescription>
            {isImage ? 'Image preview with basic editing tools' : isVideo ? 'Video preview' : 'Audio preview'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] bg-muted/30 rounded-lg overflow-hidden">
          {loading && <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />}

          {!loading && url && isImage && (
            <>
              <canvas ref={canvasRef} className="hidden" />
              <img
                ref={imgRef}
                src={url}
                alt={filename}
                className="max-h-[400px] max-w-full object-contain transition-all"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                }}
              />
            </>
          )}

          {!loading && url && isVideo && (
            <video src={url} controls className="max-h-[400px] max-w-full" />
          )}

          {!loading && url && isAudio && (
            <div className="w-full px-8 py-12 text-center">
              <div className="text-4xl mb-4">🎵</div>
              <p className="text-sm text-muted-foreground mb-4 truncate">{filename}</p>
              <audio src={url} controls className="w-full" />
            </div>
          )}
        </div>

        {/* Image editing controls */}
        {isImage && !loading && url && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setRotation(r => (r - 90 + 360) % 360)}>
                <RotateCcw className="h-4 w-4 mr-1" /> Rotate Left
              </Button>
              <Button variant="outline" size="sm" onClick={() => setRotation(r => (r + 90) % 360)}>
                <RotateCw className="h-4 w-4 mr-1" /> Rotate Right
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sun className="h-3.5 w-3.5" /> Brightness: {brightness}%
                </div>
                <Slider value={[brightness]} min={20} max={200} step={5} onValueChange={([v]) => setBrightness(v)} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Contrast className="h-3.5 w-3.5" /> Contrast: {contrast}%
                </div>
                <Slider value={[contrast]} min={20} max={200} step={5} onValueChange={([v]) => setContrast(v)} />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={handleDownloadOriginal}>
            <Download className="h-4 w-4 mr-1" /> Download Original
          </Button>
          {isImage && hasEdits && (
            <>
              <Button variant="outline" size="sm" onClick={handleDownloadEdited}>
                <Download className="h-4 w-4 mr-1" /> Download Edited
              </Button>
              {onSaveEdited && (
                <Button size="sm" onClick={handleSaveToServer} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                  Save to Server
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

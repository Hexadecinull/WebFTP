import { Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { FtpEntry } from '@/types/ftp';

interface DownloadFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder: FtpEntry | null;
  onDownload: (folder: FtpEntry, format: string) => void;
}

export const DownloadFolderDialog = ({ open, onOpenChange, folder, onDownload }: DownloadFolderDialogProps) => {
  const [format, setFormat] = useState('zip');

  const handleDownload = () => {
    if (folder) {
      onDownload(folder, format);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Download Folder
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Download <span className="font-medium text-foreground">{folder?.name}</span> as an archive
          </p>
          <div className="space-y-2">
            <Label>Archive Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zip">ZIP (.zip)</SelectItem>
                <SelectItem value="tar">TAR (.tar)</SelectItem>
                <SelectItem value="tar.gz">TAR.GZ (.tar.gz)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleDownload}>Download</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

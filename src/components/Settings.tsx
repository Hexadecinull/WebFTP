// View Layer - Settings Component

import { useState } from 'react';
import { X, Palette, Settings as SettingsIcon, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';

interface SettingsProps {
  onClose: () => void;
}

const themePresets = [
  { name: 'Default Blue', primary: '221.2 83.2% 53.3%', accent: '210 40% 96.1%' },
  { name: 'Purple', primary: '262.1 83.3% 57.8%', accent: '270 40% 96.1%' },
  { name: 'Green', primary: '142.1 76.2% 36.3%', accent: '138 40% 96.1%' },
  { name: 'Red', primary: '346.8 77.2% 49.8%', accent: '0 40% 96.1%' },
  { name: 'Orange', primary: '24.6 95% 53.1%', accent: '33 40% 96.1%' },
  { name: 'Teal', primary: '173.4 80.4% 40%', accent: '180 40% 96.1%' },
  { name: 'Pink', primary: '330.4 81.2% 60.4%', accent: '336 40% 96.1%' },
  { name: 'Cyan', primary: '188.7 94.5% 42.7%', accent: '197 40% 96.1%' },
  { name: 'Indigo', primary: '238.7 83.5% 66.7%', accent: '240 40% 96.1%' },
  { name: 'Amber', primary: '45.4 93.4% 47.5%', accent: '48 40% 96.1%' },
];

export const Settings = ({ onClose }: SettingsProps) => {
  const [selectedTheme, setSelectedTheme] = useState(themePresets[0]);
  const { theme, toggleTheme } = useTheme();
  const [concurrentTransfers, setConcurrentTransfers] = useState(() => {
    return parseInt(localStorage.getItem('concurrentTransfers') || '3');
  });
  const [autoRetry, setAutoRetry] = useState(() => {
    return localStorage.getItem('autoRetry') === 'true';
  });
  const [bufferSize, setBufferSize] = useState(() => {
    return parseInt(localStorage.getItem('bufferSize') || '8192');
  });

  const applyTheme = (themePreset: typeof themePresets[0]) => {
    document.documentElement.style.setProperty('--primary', themePreset.primary);
    document.documentElement.style.setProperty('--accent', themePreset.accent);
    setSelectedTheme(themePreset);
    toast({
      title: 'Theme Applied',
      description: `${themePreset.name} theme has been applied`,
    });
  };

  const handleConcurrentTransfersChange = (value: number) => {
    setConcurrentTransfers(value);
    localStorage.setItem('concurrentTransfers', value.toString());
  };

  const handleAutoRetryChange = (checked: boolean) => {
    setAutoRetry(checked);
    localStorage.setItem('autoRetry', checked.toString());
  };

  const handleBufferSizeChange = (value: number) => {
    setBufferSize(value);
    localStorage.setItem('bufferSize', value.toString());
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-fade-in">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-card">
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Settings</h2>
          </div>
          
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-6">
          <Tabs defaultValue="appearance" className="w-full max-w-3xl mx-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="connection">Connection</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            
            <TabsContent value="appearance" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    <div>
                      <Label className="text-base font-semibold">Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
                    </div>
                  </div>
                  <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                </div>

                <div className="flex items-center gap-2 mt-6">
                  <Palette className="h-5 w-5 text-primary" />
                  <Label className="text-lg font-semibold">Color Themes</Label>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {themePresets.map((theme) => (
                    <button
                      key={theme.name}
                      onClick={() => applyTheme(theme)}
                      className={`
                        p-4 rounded-lg border-2 transition-all hover:scale-105
                        ${selectedTheme.name === theme.name 
                          ? 'border-primary bg-accent' 
                          : 'border-border hover:border-primary/50'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full"
                          style={{ backgroundColor: `hsl(${theme.primary})` }}
                        />
                        <span className="font-medium">{theme.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="connection" className="space-y-6 mt-6">
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Connection Settings</Label>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <Label className="text-base font-semibold">Auto Retry Failed Transfers</Label>
                      <p className="text-sm text-muted-foreground">Automatically retry failed uploads/downloads</p>
                    </div>
                    <Switch checked={autoRetry} onCheckedChange={handleAutoRetryChange} />
                  </div>

                  <div className="p-4 border border-border rounded-lg space-y-2">
                    <Label className="text-base font-semibold">Connection Timeout</Label>
                    <p className="text-sm text-muted-foreground">Timeout for FTP/SFTP connections (seconds)</p>
                    <Input type="number" defaultValue="30" className="mt-2" />
                  </div>

                  <div className="p-4 border border-border rounded-lg space-y-2">
                    <Label className="text-base font-semibold">Keep-Alive Interval</Label>
                    <p className="text-sm text-muted-foreground">Send keep-alive packets every (seconds)</p>
                    <Input type="number" defaultValue="60" className="mt-2" />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-6 mt-6">
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Advanced Settings</Label>
                
                <div className="space-y-4">
                  <div className="p-4 border border-border rounded-lg space-y-2">
                    <Label className="text-base font-semibold">Concurrent Transfers</Label>
                    <p className="text-sm text-muted-foreground">Maximum number of simultaneous file transfers</p>
                    <Input 
                      type="number" 
                      value={concurrentTransfers}
                      onChange={(e) => handleConcurrentTransfersChange(parseInt(e.target.value))}
                      min="1"
                      max="10"
                      className="mt-2" 
                    />
                  </div>

                  <div className="p-4 border border-border rounded-lg space-y-2">
                    <Label className="text-base font-semibold">Buffer Size</Label>
                    <p className="text-sm text-muted-foreground">Transfer buffer size in bytes (higher = faster but more memory)</p>
                    <Input 
                      type="number" 
                      value={bufferSize}
                      onChange={(e) => handleBufferSizeChange(parseInt(e.target.value))}
                      className="mt-2" 
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <Label className="text-base font-semibold">Enable Logging</Label>
                      <p className="text-sm text-muted-foreground">Log FTP commands and responses to console</p>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <Label className="text-base font-semibold">Use Passive Mode</Label>
                      <p className="text-sm text-muted-foreground">Use passive FTP mode for better firewall compatibility</p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </div>
    </div>
  );
};

// View Layer - Settings Component

import { useState } from 'react';
import { X, Palette, Settings as SettingsIcon, Moon, Sun, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
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
  const { user } = useAuth();
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
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="connection">Connection</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="professional" disabled={!user}>
                <div className="flex items-center gap-1">
                  Professional
                  {!user && <Lock className="h-3 w-3" />}
                </div>
              </TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
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
                  {themePresets.map((themePreset) => (
                    <button
                      key={themePreset.name}
                      onClick={() => applyTheme(themePreset)}
                      className={`
                        p-4 rounded-lg border-2 transition-all hover:scale-105
                        ${selectedTheme.name === themePreset.name 
                          ? 'border-border' 
                          : 'border-border hover:border-primary/50'
                        }
                      `}
                      style={selectedTheme.name === themePreset.name ? {
                        boxShadow: `0 0 0 2px hsl(${themePreset.primary})`
                      } : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full border border-border"
                          style={{ backgroundColor: `hsl(${themePreset.primary})` }}
                        />
                        <span className="font-medium text-foreground">{themePreset.name}</span>
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
            
            <TabsContent value="professional" className="space-y-6 mt-6">
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Professional Settings</Label>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <Label className="text-base font-semibold">Enable Compression</Label>
                      <p className="text-sm text-muted-foreground">Compress files before transfer to save bandwidth</p>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <Label className="text-base font-semibold">Enable Transfer Verification</Label>
                      <p className="text-sm text-muted-foreground">Verify file integrity after transfer using checksums</p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>

                  <div className="p-4 border border-border rounded-lg space-y-2">
                    <Label className="text-base font-semibold">Encryption Level</Label>
                    <p className="text-sm text-muted-foreground">Choose encryption strength for secure connections</p>
                    <select className="w-full mt-2 p-2 border border-border rounded-lg bg-background">
                      <option>Standard (128-bit)</option>
                      <option>Strong (256-bit)</option>
                      <option>Maximum (AES-256-GCM)</option>
                    </select>
                  </div>

                  <div className="p-4 border border-border rounded-lg space-y-2">
                    <Label className="text-base font-semibold">Bandwidth Limit</Label>
                    <p className="text-sm text-muted-foreground">Limit transfer speed (KB/s, 0 = unlimited)</p>
                    <Input type="number" defaultValue="0" min="0" className="mt-2" />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <Label className="text-base font-semibold">Auto-Resume Transfers</Label>
                      <p className="text-sm text-muted-foreground">Automatically resume interrupted transfers on reconnect</p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>

                  <div className="p-4 border border-border rounded-lg space-y-2">
                    <Label className="text-base font-semibold">Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">Automatically disconnect after inactivity (minutes)</p>
                    <Input type="number" defaultValue="30" min="5" max="120" className="mt-2" />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="about" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="text-center space-y-4 py-6">
                  <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-4xl font-bold text-primary">WF</span>
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold">WebFTP</h2>
                    <p className="text-muted-foreground">Version 1.0.0</p>
                  </div>
                  
                  <div className="max-w-md mx-auto space-y-4 text-left">
                    <div className="p-4 border border-border rounded-lg">
                      <Label className="text-base font-semibold">Authors</Label>
                      <p className="text-sm text-muted-foreground mt-1">Lovable AI & User Collaboration</p>
                    </div>
                    
                    <div className="p-4 border border-border rounded-lg">
                      <Label className="text-base font-semibold">Technologies</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">React</span>
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">TypeScript</span>
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">Tailwind CSS</span>
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">Vite</span>
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">CodeMirror</span>
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">Lovable Cloud</span>
                      </div>
                    </div>
                    
                    <div className="p-4 border border-border rounded-lg">
                      <Label className="text-base font-semibold">Supported Protocols</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-2 py-1 bg-accent text-accent-foreground rounded text-xs">FTP</span>
                        <span className="px-2 py-1 bg-accent text-accent-foreground rounded text-xs">FTPS</span>
                        <span className="px-2 py-1 bg-accent text-accent-foreground rounded text-xs">SFTP</span>
                        <span className="px-2 py-1 bg-accent text-accent-foreground rounded text-xs">SMB</span>
                        <span className="px-2 py-1 bg-accent text-accent-foreground rounded text-xs">WebDAV</span>
                        <span className="px-2 py-1 bg-accent text-accent-foreground rounded text-xs">Local Network</span>
                      </div>
                    </div>
                    
                    <div className="p-4 border border-border rounded-lg">
                      <Label className="text-base font-semibold">Description</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        A modern, web-based FTP client with support for multiple protocols, 
                        inline file editing, and a beautiful user interface. Built with React 
                        and powered by Lovable Cloud.
                      </p>
                    </div>
                    
                    <div className="p-4 border border-border rounded-lg">
                      <Label className="text-base font-semibold">License</Label>
                      <p className="text-sm text-muted-foreground mt-1">MIT License</p>
                    </div>
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

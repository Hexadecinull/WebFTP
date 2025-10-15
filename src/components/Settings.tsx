// View Layer - Settings Component

import { useState } from 'react';
import { X, Palette, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

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

  const applyTheme = (theme: typeof themePresets[0]) => {
    document.documentElement.style.setProperty('--primary', theme.primary);
    document.documentElement.style.setProperty('--accent', theme.accent);
    setSelectedTheme(theme);
    toast({
      title: 'Theme Applied',
      description: `${theme.name} theme has been applied`,
    });
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
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <Label className="text-lg font-semibold">Theme Presets</Label>
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
                <p className="text-sm text-muted-foreground">
                  Connection timeout, retry settings, and other FTP/SFTP options will be available here.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-6 mt-6">
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Advanced Settings</Label>
                <p className="text-sm text-muted-foreground">
                  Advanced features like concurrent transfers, buffer sizes, and logging options will be available here.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </div>
    </div>
  );
};

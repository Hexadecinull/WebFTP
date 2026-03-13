// View Layer - Settings Component

import { useState, useEffect } from 'react';
import { X, Palette, Settings as SettingsIcon, Moon, Sun, Lock, Github } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SettingsProps {
  onClose: () => void;
}

const themePresets = [
  { name: 'Default Blue', primary: '200 95% 45%', accent: '180 75% 50%' },
  { name: 'Purple', primary: '262.1 83.3% 57.8%', accent: '270 40% 96.1%' },
  { name: 'Green', primary: '142.1 76.2% 36.3%', accent: '138 40% 96.1%' },
  { name: 'Red', primary: '0 84% 60%', accent: '0 40% 96.1%' },
  { name: 'Orange', primary: '24.6 95% 53.1%', accent: '33 40% 96.1%' },
  { name: 'Teal', primary: '173.4 80.4% 40%', accent: '180 40% 96.1%' },
  { name: 'Pink', primary: '330.4 81.2% 60.4%', accent: '336 40% 96.1%' },
  { name: 'Cyan', primary: '188.7 94.5% 42.7%', accent: '197 40% 96.1%' },
  { name: 'Indigo', primary: '238.7 83.5% 66.7%', accent: '240 40% 96.1%' },
  { name: 'Amber', primary: '45.4 93.4% 47.5%', accent: '48 40% 96.1%' },
  { name: 'Emerald', primary: '160 84% 39%', accent: '152 40% 96.1%' },
  { name: 'Rose', primary: '350 89% 60%', accent: '350 40% 96.1%' },
  { name: 'Violet', primary: '258 90% 66%', accent: '258 40% 96.1%' },
  { name: 'Sky', primary: '199 89% 48%', accent: '199 40% 96.1%' },
  { name: 'Fuchsia', primary: '292 84% 61%', accent: '292 40% 96.1%' },
];

export const Settings = ({ onClose }: SettingsProps) => {
  const { user, signOut } = useAuth();
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState(() => {
    const savedPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    return themePresets.find(t => t.primary === savedPrimary) || themePresets[0];
  });
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
  const [connectionTimeout, setConnectionTimeout] = useState(() => {
    return parseInt(localStorage.getItem('connectionTimeout') || '30');
  });
  const [keepAliveInterval, setKeepAliveInterval] = useState(() => {
    return parseInt(localStorage.getItem('keepAliveInterval') || '60');
  });
  const [enableLogging, setEnableLogging] = useState(() => {
    return localStorage.getItem('enableLogging') === 'true';
  });
  const [usePassiveMode, setUsePassiveMode] = useState(() => {
    return localStorage.getItem('usePassiveMode') !== 'false';
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customColor, setCustomColor] = useState('#0ea5e9');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [useSystemTheme, setUseSystemTheme] = useState(() => {
    return localStorage.getItem('useSystemTheme') !== 'false';
  });
  const [useAmoled, setUseAmoled] = useState(() => {
    return localStorage.getItem('useAmoled') === 'true';
  });
  const [useMaterialYou, setUseMaterialYou] = useState(() => {
    return localStorage.getItem('useMaterialYou') !== 'false';
  });
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const currentPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    const current = themePresets.find(t => t.primary === currentPrimary);
    if (current) {
      setSelectedTheme(current);
    }
  }, []);

  // Reapply Material You theming when theme mode, AMOLED, or Material You setting changes
  useEffect(() => {
    const primaryHsl = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    if (primaryHsl) {
      applyMaterialYouTheming(primaryHsl);
    }
  }, [theme, useAmoled, useMaterialYou]);

  // System theme detection
  useEffect(() => {
    if (useSystemTheme) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        if (useSystemTheme) {
          if (e.matches && theme !== 'dark') {
            toggleTheme();
          } else if (!e.matches && theme !== 'light') {
            toggleTheme();
          }
        }
      };
      
      // Set initial theme based on system preference
      if (mediaQuery.matches && theme !== 'dark') {
        toggleTheme();
      } else if (!mediaQuery.matches && theme !== 'light') {
        toggleTheme();
      }
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [useSystemTheme, theme, toggleTheme]);

  const applyMaterialYouTheming = (primaryHsl: string) => {
    if (!useMaterialYou) return;
    
    const [h, s, l] = primaryHsl.split(' ').map(v => parseFloat(v));
    const isDark = theme === 'dark';
    
    if (isDark) {
      const bgLightness = useAmoled ? 0 : 10;
      const sat = Math.min(s * 0.2, 20);
      document.documentElement.style.setProperty('--background', `${h} ${sat}% ${bgLightness}%`);
      document.documentElement.style.setProperty('--card', `${h} ${Math.min(s * 0.2, 18)}% ${Math.min(bgLightness + 4, 14)}%`);
      document.documentElement.style.setProperty('--popover', `${h} ${Math.min(s * 0.2, 18)}% ${Math.min(bgLightness + 4, 14)}%`);
      document.documentElement.style.setProperty('--sidebar-background', `${h} ${Math.min(s * 0.15, 20)}% ${Math.min(bgLightness + 2, 12)}%`);
      document.documentElement.style.setProperty('--sidebar-accent', `${h} ${Math.min(s * 0.2, 18)}% ${Math.min(bgLightness + 8, 18)}%`);
      document.documentElement.style.setProperty('--muted', `${h} ${Math.min(s * 0.15, 20)}% ${Math.min(bgLightness + 5, 15)}%`);
      document.documentElement.style.setProperty('--secondary', `${h} ${Math.min(s * 0.18, 18)}% ${Math.min(bgLightness + 6, 18)}%`);
      document.documentElement.style.setProperty('--border', `${h} ${Math.min(s * 0.15, 16)}% ${Math.min(bgLightness + 10, 20)}%`);
      document.documentElement.style.setProperty('--input', `${h} ${Math.min(s * 0.15, 16)}% ${Math.min(bgLightness + 10, 20)}%`);
    } else {
      // Light mode - clearly visible tints derived from the primary color
      const lightSat = Math.min(s * 0.4, 45);
      document.documentElement.style.setProperty('--background', `${h} ${lightSat}% 96%`);
      document.documentElement.style.setProperty('--card', `${h} ${Math.min(s * 0.3, 30)}% 98%`);
      document.documentElement.style.setProperty('--popover', `${h} ${Math.min(s * 0.3, 30)}% 98%`);
      document.documentElement.style.setProperty('--sidebar-background', `${h} ${Math.min(s * 0.35, 40)}% 95%`);
      document.documentElement.style.setProperty('--sidebar-accent', `${h} ${Math.min(s * 0.4, 45)}% 90%`);
      document.documentElement.style.setProperty('--muted', `${h} ${Math.min(s * 0.35, 40)}% 92%`);
      document.documentElement.style.setProperty('--secondary', `${h} ${Math.min(s * 0.3, 35)}% 90%`);
      document.documentElement.style.setProperty('--border', `${h} ${Math.min(s * 0.25, 30)}% 85%`);
      document.documentElement.style.setProperty('--input', `${h} ${Math.min(s * 0.25, 30)}% 85%`);
    }
  };

  const applyTheme = (themePreset: typeof themePresets[0]) => {
    document.documentElement.style.setProperty('--primary', themePreset.primary);
    document.documentElement.style.setProperty('--accent', themePreset.accent);
    applyMaterialYouTheming(themePreset.primary);
    setSelectedTheme(themePreset);
    localStorage.setItem('selectedThemeName', themePreset.name);
    toast({
      title: 'Theme Applied',
      description: `${themePreset.name} theme has been applied`,
    });
  };

  // Clamp saturation to avoid garish buttons while keeping the hue
  const clampSaturation = (satPercent: number, lightPercent: number): number => {
    // If very saturated (>85%) and mid-lightness, desaturate to a tasteful level
    if (satPercent > 85 && lightPercent > 30 && lightPercent < 70) {
      return 75;
    }
    return satPercent;
  };

  const applyCustomColor = (hexColor: string) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    let adjustedL = Math.round(l * 100);
    let adjustedS = Math.round(s * 100);

    // Avoid pure black (#000000) - bump to dark gray
    if (adjustedL === 0 && adjustedS === 0) {
      adjustedL = 15;
      adjustedS = 10;
    }
    // Avoid very dark colors that look invisible
    if (adjustedL < 10) {
      adjustedL = 15;
    }

    // Clamp oversaturated colors
    adjustedS = clampSaturation(adjustedS, adjustedL);

    const hsl = `${Math.round(h * 360)} ${adjustedS}% ${adjustedL}%`;
    document.documentElement.style.setProperty('--primary', hsl);
    applyMaterialYouTheming(hsl);
    localStorage.setItem('customPrimaryColor', hsl);
    toast({
      title: 'Custom Color Applied',
      description: 'Your custom color has been applied',
    });
  };

  // Calculate if text should be black or white based on background luminance
  const getProtocolTextColor = () => {
    const primaryHsl = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    const [, , l] = primaryHsl.split(' ').map(v => parseFloat(v));
    // If lightness > 70%, use black text, otherwise white
    return l > 70 ? 'text-black' : 'text-white';
  };

  const handleSystemThemeChange = (checked: boolean) => {
    setUseSystemTheme(checked);
    localStorage.setItem('useSystemTheme', checked.toString());
  };

  const handleAmoledChange = (checked: boolean) => {
    setUseAmoled(checked);
    localStorage.setItem('useAmoled', checked.toString());
    
    if (checked && theme === 'dark') {
      // Apply pure black immediately
      document.documentElement.style.setProperty('--background', '0 0% 0%');
      document.documentElement.style.setProperty('--card', '0 0% 4%');
      document.documentElement.style.setProperty('--popover', '0 0% 4%');
      document.documentElement.style.setProperty('--sidebar-background', '0 0% 2%');
      document.documentElement.style.setProperty('--sidebar-accent', '0 0% 8%');
    } else {
      // Reapply Material You or default theming
      const primaryHsl = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
      if (primaryHsl && useMaterialYou) {
        applyMaterialYouTheming(primaryHsl);
      } else if (theme === 'dark') {
        // Reset to default dark values
        document.documentElement.style.setProperty('--background', '220 20% 10%');
        document.documentElement.style.setProperty('--card', '220 18% 14%');
        document.documentElement.style.setProperty('--popover', '220 18% 14%');
        document.documentElement.style.setProperty('--sidebar-background', '220 20% 12%');
        document.documentElement.style.setProperty('--sidebar-accent', '220 18% 18%');
      }
    }
  };

  const handleMaterialYouChange = (checked: boolean) => {
    setUseMaterialYou(checked);
    localStorage.setItem('useMaterialYou', checked.toString());
    
    if (!checked) {
      // Reset to default values from index.css
      if (theme === 'dark') {
        document.documentElement.style.setProperty('--background', '220 20% 10%');
        document.documentElement.style.setProperty('--card', '220 18% 14%');
        document.documentElement.style.setProperty('--popover', '220 18% 14%');
        document.documentElement.style.setProperty('--sidebar-background', '220 20% 12%');
        document.documentElement.style.setProperty('--sidebar-accent', '220 18% 18%');
      } else {
        document.documentElement.style.setProperty('--background', '220 18% 97%');
        document.documentElement.style.setProperty('--card', '0 0% 100%');
        document.documentElement.style.setProperty('--popover', '0 0% 100%');
        document.documentElement.style.setProperty('--sidebar-background', '220 18% 99%');
        document.documentElement.style.setProperty('--sidebar-accent', '200 80% 96%');
      }
    } else {
      // Reapply Material You theming
      const primaryHsl = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
      if (primaryHsl) {
        applyMaterialYouTheming(primaryHsl);
      }
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 150);
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

  const handleConnectionTimeoutChange = (value: number) => {
    setConnectionTimeout(value);
    localStorage.setItem('connectionTimeout', value.toString());
  };

  const handleKeepAliveIntervalChange = (value: number) => {
    setKeepAliveInterval(value);
    localStorage.setItem('keepAliveInterval', value.toString());
  };

  const handleEnableLoggingChange = (checked: boolean) => {
    setEnableLogging(checked);
    localStorage.setItem('enableLogging', checked.toString());
  };

  const handleUsePassiveModeChange = (checked: boolean) => {
    setUsePassiveMode(checked);
    localStorage.setItem('usePassiveMode', checked.toString());
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      // Delete user's profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Delete user account (requires service role in production)
      // This will trigger cascade deletion
      await signOut();
      
      toast({
        title: 'Account Deleted',
        description: 'Your account has been successfully deleted',
      });
      
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete account',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className={`fixed inset-0 z-50 bg-background/95 backdrop-blur-sm ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
      <div className={`h-full flex flex-col ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`}>
        {/* Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-card">
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Settings</h2>
          </div>
          
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-6">
          <Tabs defaultValue="appearance" className="w-full max-w-3xl mx-auto">
            <TabsList className="grid w-full grid-cols-5 bg-muted">
              <TabsTrigger value="appearance" className="transition-all data-[state=active]:bg-background">Appearance</TabsTrigger>
              <TabsTrigger value="connection" className="transition-all data-[state=active]:bg-background">Connection</TabsTrigger>
              <TabsTrigger value="advanced" className="transition-all data-[state=active]:bg-background">Advanced</TabsTrigger>
              <TabsTrigger value="professional" disabled={!user} className="transition-all data-[state=active]:bg-background">
                <div className="flex items-center gap-1">
                  Professional
                  {!user && <Lock className="h-3 w-3" />}
                </div>
              </TabsTrigger>
              <TabsTrigger value="about" className="transition-all data-[state=active]:bg-background">About</TabsTrigger>
            </TabsList>
            
            <TabsContent value="appearance" className="space-y-6 mt-6 animate-fade-in">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    <div>
                      <Label className="text-base font-semibold">System Theme</Label>
                      <p className="text-sm text-muted-foreground">Automatically match your system theme</p>
                    </div>
                  </div>
                  <Switch checked={useSystemTheme} onCheckedChange={handleSystemThemeChange} />
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    <div>
                      <Label className="text-base font-semibold">Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
                    </div>
                  </div>
                  <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} disabled={useSystemTheme} />
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Moon className="h-5 w-5" />
                    <div>
                      <Label className="text-base font-semibold">AMOLED (Pure Black)</Label>
                      <p className="text-sm text-muted-foreground">Use pure black backgrounds (applies in dark mode)</p>
                    </div>
                  </div>
                  <Switch checked={useAmoled} onCheckedChange={handleAmoledChange} />
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Palette className="h-5 w-5" />
                    <div>
                      <Label className="text-base font-semibold">Material You Theming</Label>
                      <p className="text-sm text-muted-foreground">Apply dynamic color hints from your theme</p>
                    </div>
                  </div>
                  <Switch checked={useMaterialYou} onCheckedChange={handleMaterialYouChange} />
                </div>

                <div className="flex items-center gap-2 mt-6">
                  <Palette className="h-5 w-5 text-primary" />
                  <Label className="text-lg font-semibold">Color Themes</Label>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {themePresets.map((themePreset) => {
                    const isSelected = selectedTheme.name === themePreset.name;
                    const displayColor = hoveredTheme === themePreset.name ? themePreset.primary : (isSelected ? themePreset.primary : undefined);
                    
                    return (
                      <button
                        key={themePreset.name}
                        onClick={() => applyTheme(themePreset)}
                        onMouseEnter={() => setHoveredTheme(themePreset.name)}
                        onMouseLeave={() => setHoveredTheme(null)}
                        className="p-4 rounded-lg border-2 border-border transition-all hover:scale-105"
                        style={displayColor ? {
                          boxShadow: `0 0 0 2px hsl(${displayColor})`
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
                    );
                  })}
                </div>

                <div className="mt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    {showColorPicker ? 'Hide' : 'Show'} Custom Color Picker
                  </Button>

                  {showColorPicker && (
                    <div className="mt-4 p-4 border border-border rounded-lg space-y-4 animate-fade-in">
                      <Label className="text-base font-semibold">Custom Color</Label>
                      <p className="text-sm text-muted-foreground">Choose any color or enter a hex code</p>
                      
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={customColor}
                          onChange={(e) => setCustomColor(e.target.value)}
                          className="w-20 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={customColor}
                          onChange={(e) => setCustomColor(e.target.value)}
                          placeholder="#0ea5e9"
                          className="flex-1"
                          pattern="^#[0-9A-Fa-f]{6}$"
                        />
                        <Button onClick={() => applyCustomColor(customColor)}>
                          Apply
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="connection" className="space-y-6 mt-6 animate-fade-in">
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
                    <Input 
                      type="number" 
                      value={connectionTimeout}
                      onChange={(e) => handleConnectionTimeoutChange(parseInt(e.target.value))}
                      min="5"
                      max="300"
                      className="mt-2" 
                    />
                  </div>

                  <div className="p-4 border border-border rounded-lg space-y-2">
                    <Label className="text-base font-semibold">Keep-Alive Interval</Label>
                    <p className="text-sm text-muted-foreground">Send keep-alive packets every (seconds)</p>
                    <Input 
                      type="number" 
                      value={keepAliveInterval}
                      onChange={(e) => handleKeepAliveIntervalChange(parseInt(e.target.value))}
                      min="10"
                      max="300"
                      className="mt-2" 
                    />
                  </div>

                  <div className="p-4 border border-border rounded-lg space-y-2">
                    <Label className="text-base font-semibold">Max Retry Attempts</Label>
                    <p className="text-sm text-muted-foreground">Number of times to retry a failed connection</p>
                    <Input type="number" defaultValue="3" min="0" max="10" className="mt-2" />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <Label className="text-base font-semibold">Auto Reconnect</Label>
                      <p className="text-sm text-muted-foreground">Automatically reconnect when connection drops</p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>

                  <div className="p-4 border border-border rounded-lg space-y-2">
                    <Label className="text-base font-semibold">Default Protocol</Label>
                    <p className="text-sm text-muted-foreground">Default protocol when creating new connections</p>
                    <select className="w-full mt-2 p-2 border border-border rounded-lg bg-background text-foreground">
                      <option>FTP / FTPS</option>
                      <option>SFTP</option>
                      <option>SMB</option>
                      <option>WebDAV</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <Label className="text-base font-semibold">Verify SSL Certificates</Label>
                      <p className="text-sm text-muted-foreground">Reject connections with invalid SSL certificates</p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-6 mt-6 animate-fade-in">
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
                    <Switch checked={enableLogging} onCheckedChange={handleEnableLoggingChange} />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <Label className="text-base font-semibold">Use Passive Mode</Label>
                      <p className="text-sm text-muted-foreground">Use passive FTP mode for better firewall compatibility</p>
                    </div>
                    <Switch checked={usePassiveMode} onCheckedChange={handleUsePassiveModeChange} />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <Label className="text-base font-semibold">Preserve File Timestamps</Label>
                      <p className="text-sm text-muted-foreground">Keep original modification dates when transferring</p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <Label className="text-base font-semibold">Show Hidden Files</Label>
                      <p className="text-sm text-muted-foreground">Display dotfiles and hidden directories</p>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>

                  <div className="p-4 border border-border rounded-lg space-y-2">
                    <Label className="text-base font-semibold">File Overwrite Policy</Label>
                    <p className="text-sm text-muted-foreground">What to do when a file already exists at the destination</p>
                    <select className="w-full mt-2 p-2 border border-border rounded-lg bg-background text-foreground">
                      <option>Ask every time</option>
                      <option>Always overwrite</option>
                      <option>Skip existing</option>
                      <option>Rename with suffix</option>
                    </select>
                  </div>

                  <div className="p-4 border border-border rounded-lg space-y-2">
                    <Label className="text-base font-semibold">Temporary File Directory</Label>
                    <p className="text-sm text-muted-foreground">Directory for temporary download files</p>
                    <Input type="text" defaultValue="/tmp" className="mt-2" />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="professional" className="space-y-6 mt-6 animate-fade-in">
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
                    <select className="w-full mt-2 p-2 border border-border rounded-lg bg-background text-foreground">
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

                  <div className="p-4 border border-border rounded-lg space-y-2">
                    <Label className="text-base font-semibold">Checksum Algorithm</Label>
                    <p className="text-sm text-muted-foreground">Algorithm used for transfer verification</p>
                    <select className="w-full mt-2 p-2 border border-border rounded-lg bg-background text-foreground">
                      <option>MD5</option>
                      <option>SHA-1</option>
                      <option>SHA-256</option>
                      <option>CRC32</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <Label className="text-base font-semibold">Transfer Scheduling</Label>
                      <p className="text-sm text-muted-foreground">Queue transfers to run at a scheduled time</p>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <Label className="text-base font-semibold">Directory Comparison</Label>
                      <p className="text-sm text-muted-foreground">Show differences between local and remote directories</p>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <Label className="text-base font-semibold">Transfer Notifications</Label>
                      <p className="text-sm text-muted-foreground">Show desktop notifications when transfers complete</p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>

                  <div className="p-4 border border-border rounded-lg space-y-2">
                    <Label className="text-base font-semibold">Speed Graph History</Label>
                    <p className="text-sm text-muted-foreground">Duration of transfer speed history to display (seconds)</p>
                    <Input type="number" defaultValue="60" min="10" max="300" className="mt-2" />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="about" className="space-y-6 mt-6 animate-fade-in">
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
                        <span className={`px-2 py-1 bg-primary rounded text-xs font-medium ${getProtocolTextColor()}`}>FTP</span>
                        <span className={`px-2 py-1 bg-primary rounded text-xs font-medium ${getProtocolTextColor()}`}>FTPS</span>
                        <span className={`px-2 py-1 bg-primary rounded text-xs font-medium ${getProtocolTextColor()}`}>SFTP</span>
                        <span className={`px-2 py-1 bg-primary rounded text-xs font-medium ${getProtocolTextColor()}`}>SMB</span>
                        <span className={`px-2 py-1 bg-primary rounded text-xs font-medium ${getProtocolTextColor()}`}>WebDAV</span>
                        <span className={`px-2 py-1 bg-primary rounded text-xs font-medium ${getProtocolTextColor()}`}>Local Network</span>
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
                      <Label className="text-base font-semibold">Source Code</Label>
                      <p className="text-sm text-muted-foreground mt-1 mb-3">
                        This project is open source under the MIT License
                      </p>
                      <Button
                        variant="outline"
                        className="w-full hover:bg-accent hover:text-foreground"
                        onClick={() => window.open('https://github.com/SSMG4/WebFTP', '_blank')}
                      >
                        <Github className="h-4 w-4 mr-2" />
                        View on GitHub
                      </Button>
                    </div>
                    
                    <div className="p-4 border border-border rounded-lg">
                      <Label className="text-base font-semibold">Status</Label>
                      <p className="text-sm text-muted-foreground mt-1 mb-3">
                        Repository status badges
                      </p>
                      {/* Add your shields.io badges here as img tags. Example:
                        <img src="https://img.shields.io/github/stars/SSMG4/WebFTP?style=social" alt="GitHub stars" />
                        <img src="https://img.shields.io/github/issues/SSMG4/WebFTP" alt="GitHub issues" />
                        <img src="https://img.shields.io/github/forks/SSMG4/WebFTP?style=social" alt="GitHub forks" />
                        <img src="https://img.shields.io/github/license/SSMG4/WebFTP" alt="License" />
                      */}
                      <div className="flex flex-wrap gap-2">
                        {/* Your badges will appear here */}
                      </div>
                    </div>

                    {user && (
                      <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/5">
                        <Label className="text-base font-semibold text-destructive">Danger Zone</Label>
                        <p className="text-sm text-muted-foreground mt-1 mb-3">
                          Permanently delete your account and all associated data
                        </p>
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={() => setDeleteDialogOpen(true)}
                        >
                          Delete Account
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove all your data from our servers including saved connections,
              bookmarks, and settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// View Layer - Application Sidebar

import { Plus, Server, Bookmark, History } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

const motivationalPhrases = [
  "Stay focused and keep building!",
  "You got this - keep going strong!",
  "Keep pushing forward, you're doing great!",
  "Almost there, don't give up now!",
  "Great work - you're making progress!",
  "Stay strong and keep at it!",
  "Keep going, success is near!",
  "Nice job - you're on the right track!",
  "Well done - keep up the momentum!",
  "Keep it up, you're crushing it!",
];

interface AppSidebarProps {
  onNewConnection: () => void;
  onShowBookmarks: () => void;
  onShowSavedConnections: () => void;
  onShowRecentConnections: () => void;
}

export function AppSidebar({ onNewConnection, onShowBookmarks, onShowSavedConnections, onShowRecentConnections }: AppSidebarProps) {
  const { open } = useSidebar();
  const { user } = useAuth();
  const [motivationalPhrase, setMotivationalPhrase] = useState('');

  useEffect(() => {
    const randomPhrase = motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)];
    setMotivationalPhrase(randomPhrase);
  }, [open]);
  
  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <div className="flex items-center justify-between p-2 border-b border-border">
        {open && (
          <span className="text-sm font-medium text-muted-foreground italic px-2">{motivationalPhrase}</span>
        )}
        <SidebarTrigger className="ml-auto" />
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Quick Access</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onNewConnection}>
                  <Plus className="h-4 w-4" />
                  {open && <span>New Connection</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {user && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={onShowSavedConnections}>
                      <Server className="h-4 w-4" />
                      {open && <span>Saved Connections</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={onShowBookmarks}>
                      <Bookmark className="h-4 w-4" />
                      {open && <span>Bookmarks</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
              
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onShowRecentConnections}>
                  <History className="h-4 w-4" />
                  {open && <span>Recent Connections</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

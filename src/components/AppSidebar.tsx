// View Layer - Application Sidebar

import { Plus, Server, Bookmark, History } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
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

interface AppSidebarProps {
  onNewConnection: () => void;
  onShowBookmarks: () => void;
  onShowSavedConnections: () => void;
  onShowRecentConnections: () => void;
}

export function AppSidebar({ onNewConnection, onShowBookmarks, onShowSavedConnections, onShowRecentConnections }: AppSidebarProps) {
  const { open } = useSidebar();
  const { user } = useAuth();
  
  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <div className="flex items-center justify-end p-2 border-b border-border">
        <div className="bg-primary/10 hover:bg-primary/20 transition-colors rounded-md">
          <SidebarTrigger />
        </div>
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

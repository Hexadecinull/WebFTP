// View Layer - Application Sidebar

import { Plus, Server, Bookmark, History } from 'lucide-react';
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
} from '@/components/ui/sidebar';

interface AppSidebarProps {
  onNewConnection: () => void;
  onShowBookmarks: () => void;
  onShowSavedConnections: () => void;
  onShowRecentConnections: () => void;
}

export function AppSidebar({ onNewConnection, onShowBookmarks, onShowSavedConnections, onShowRecentConnections }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <div className="flex items-center justify-end p-2 border-b border-border">
        <SidebarTrigger />
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Quick Access</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onNewConnection}>
                  <Plus className="h-4 w-4" />
                  <span>New Connection</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onShowSavedConnections}>
                  <Server className="h-4 w-4" />
                  <span>Saved Connections</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onShowBookmarks}>
                  <Bookmark className="h-4 w-4" />
                  <span>Bookmarks</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onShowRecentConnections}>
                  <History className="h-4 w-4" />
                  <span>Recent Connections</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

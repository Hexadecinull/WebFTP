// View Layer - Application Sidebar

import { Server, Bookmark, Settings, FolderOpen } from 'lucide-react';
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
}

export function AppSidebar({ onNewConnection, onShowBookmarks }: AppSidebarProps) {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <div className="p-4 border-b border-border flex items-center justify-between">
        {open && <h2 className="font-bold text-lg gradient-primary bg-clip-text text-transparent">FTP Client</h2>}
        <SidebarTrigger className="ml-auto" />
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onNewConnection}>
                  <Server className="h-4 w-4" />
                  {open && <span>New Connection</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton onClick={onShowBookmarks}>
                  <Bookmark className="h-4 w-4" />
                  {open && <span>Bookmarks</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Quick Access</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <FolderOpen className="h-4 w-4" />
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

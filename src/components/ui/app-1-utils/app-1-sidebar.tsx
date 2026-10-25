import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  ClipboardList,
  Settings,
  ExternalLink,
  Cake,
  LogOut,
  ChevronRight,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { app1User } from "@/components/ui/app-1-utils/app-1-data";
import { authService } from "@/services/authService";

export function App1Sidebar() {
  const location = useLocation();

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = "/admin/login";
  };

  const navItems = [
    { label: "Overview", path: "/admin", icon: LayoutDashboard },
    { label: "Products Catalog", path: "/admin/products", icon: ShoppingBag },
    { label: "Categories", path: "/admin/categories", icon: Layers },
    { label: "Orders & Pickup", path: "/admin/orders", icon: ClipboardList },
    { label: "Store Settings", path: "/admin/settings", icon: Settings },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-sidebar">
      {/* Brand Header */}
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <Cake className="size-5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="font-serif font-bold text-base tracking-tight italic truncate">
              Bake & Joy
            </span>
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
              Admin Console
            </span>
          </div>
        </Link>
      </SidebarHeader>

      {/* Nav Items */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Store Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.path === "/admin"
                    ? location.pathname === "/admin"
                    : location.pathname.startsWith(item.path);

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      <Link to={item.path} className="flex items-center gap-3">
                        <item.icon className="size-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                        {isActive && (
                          <ChevronRight className="ml-auto size-3 opacity-60 group-data-[collapsible=icon]:hidden" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Customer Facing
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="View Storefront">
                  <Link
                    to="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="size-4 shrink-0" />
                    <span>View Storefront</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Footer Profile */}
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="size-8 shrink-0">
              <AvatarImage src={app1User.avatar} alt={app1User.name} />
              <AvatarFallback>{app1User.initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
              <span className="text-xs font-medium truncate">
                {app1User.name}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                {app1User.role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors group-data-[collapsible=icon]:hidden"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

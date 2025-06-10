
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Package, 
  ShoppingCart, 
  Users, 
  FileText, 
  BarChart, 
  Receipt, 
  Settings,
  Home
} from "lucide-react";
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
} from "@/components/ui/sidebar";

const AppSidebar = () => {
  const { collapsed } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/" },
    { id: "cash-sales", label: "Cash Sales", icon: ShoppingCart, path: "/cash-sales" },
    { id: "customers", label: "Customers", icon: Users, path: "/customers" },
    { id: "products", label: "Products", icon: Package, path: "/products" },
    { id: "hire-purchase", label: "Hire Purchase", icon: FileText, path: "/hire-purchase" },
    { id: "reports", label: "Reports", icon: BarChart, path: "/reports" },
    { id: "accounting", label: "Accounting", icon: Receipt, path: "/accounting" },
  ];

  const isActive = (path: string) => currentPath === path;
  const getNavCls = (path: string) =>
    isActive(path) ? "bg-blue-600 text-white hover:bg-blue-700" : "text-gray-700 hover:bg-gray-100";

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-64"}
      collapsible
    >
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>เมนูหลัก</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.path} 
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${getNavCls(item.path)}`}
                      >
                        <Icon className="h-5 w-5" />
                        {!collapsed && <span className="font-medium">{item.label}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;

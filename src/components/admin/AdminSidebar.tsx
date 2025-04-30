
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  User, 
  MessagesSquare, 
  Settings 
} from 'lucide-react';
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarNav, 
  SidebarNavItem, 
  SidebarFooter 
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Users', path: '/admin/users', icon: <Users className="h-5 w-5" /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingCart className="h-5 w-5" /> },
    { name: 'Evaluators', path: '/admin/evaluators', icon: <User className="h-5 w-5" /> },
    { name: 'Messages', path: '/admin/messages', icon: <MessagesSquare className="h-5 w-5" /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings className="h-5 w-5" /> },
  ];
  
  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };
  
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };
  
  return (
    <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapse}>
      <SidebarHeader collapsed={collapsed}>
        <div className={cn("flex items-center gap-2", collapsed ? "justify-center" : "")}>
          <div className="rounded-md bg-primary p-1.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 1L14 5V11L8 15L2 11V5L8 1Z" fill="white" />
            </svg>
          </div>
          {!collapsed && <span className="font-semibold text-lg">Proofly Admin</span>}
        </div>
      </SidebarHeader>
      
      <SidebarNav>
        {navItems.map((item) => (
          <SidebarNavItem 
            key={item.path} 
            href={item.path} 
            icon={item.icon}
            active={location.pathname === item.path}
            collapsed={collapsed}
            onClick={(e) => {
              e.preventDefault();
              navigate(item.path);
            }}
          >
            {item.name}
          </SidebarNavItem>
        ))}
      </SidebarNav>
      
      <SidebarFooter collapsed={collapsed}>
        {collapsed ? (
          <Avatar className="h-8 w-8">
            <AvatarImage src="/avatar.png" />
            <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || 'AD'}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatar.png" />
                <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || 'AD'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.name || 'Admin User'}</span>
                <span className="text-xs text-muted-foreground">{user?.email || 'admin@example.com'}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

// Import cn from lib/utils
import { cn } from '@/lib/utils';

export default AdminSidebar;

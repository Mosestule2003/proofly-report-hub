
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  User, 
  MessagesSquare, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface AdminSidebarWithPropsProps {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
}

const AdminSidebarWithProps: React.FC<AdminSidebarWithPropsProps> = ({ 
  open, 
  onClose,
  isMobile 
}) => {
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
  
  const sidebarWidth = collapsed ? 'w-[70px]' : 'w-64';
  
  const sidebarProps = isMobile 
    ? { 
        className: `fixed inset-y-0 left-0 z-50 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`,
      } 
    : {
        className: `transition-all duration-300 ${sidebarWidth}`
      };
  
  return (
    <>
      {isMobile && open && (
        <div 
          className="fixed inset-0 bg-black/50 z-40" 
          onClick={onClose}
        />
      )}
      <div className="relative">
        <Sidebar {...sidebarProps}>
          <SidebarHeader>
            <div className="flex items-center justify-between">
              {!collapsed && (
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-primary p-1.5">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 1L14 5V11L8 15L2 11V5L8 1Z" fill="white" />
                    </svg>
                  </div>
                  <span className="font-semibold text-lg">Proofly Admin</span>
                </div>
              )}
              {collapsed && (
                <div className="mx-auto rounded-md bg-primary p-1.5">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 1L14 5V11L8 15L2 11V5L8 1Z" fill="white" />
                  </svg>
                </div>
              )}
              {!isMobile && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-auto" 
                  onClick={() => setCollapsed(!collapsed)}
                  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </SidebarHeader>
          
          <SidebarNav>
            {navItems.map((item) => (
              <SidebarNavItem 
                key={item.path} 
                href={item.path} 
                icon={item.icon}
                active={location.pathname === item.path}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.path);
                  if (isMobile) onClose();
                }}
              >
                {!collapsed && <span>{item.name}</span>}
              </SidebarNavItem>
            ))}
          </SidebarNav>
          
          {!collapsed && (
            <SidebarFooter>
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
            </SidebarFooter>
          )}
          
          {collapsed && (
            <SidebarFooter>
              <div className="flex justify-center">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatar.png" />
                  <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || 'AD'}</AvatarFallback>
                </Avatar>
              </div>
              {/* Collapsed sign out button */}
              <div className="mt-3 flex justify-center">
                <Button variant="outline" size="icon" title="Sign Out" onClick={handleLogout}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Button>
              </div>
            </SidebarFooter>
          )}
        </Sidebar>
      </div>
    </>
  );
};

export default AdminSidebarWithProps;


import * as React from "react"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ 
  className, 
  children, 
  collapsed = false,
  onToggleCollapse,
  ...props 
}: SidebarProps) {
  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 flex h-full flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
      {...props}
    >
      {children}
      {onToggleCollapse && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleCollapse}
          className="absolute -right-4 top-20 h-8 w-8 rounded-full border bg-background shadow-md"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      )}
    </div>
  )
}

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsed?: boolean;
}

export function SidebarHeader({
  className,
  children,
  collapsed = false,
  ...props
}: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        "flex h-14 items-center border-b px-4",
        collapsed && "justify-center px-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarNav({ className, children, ...props }: SidebarNavProps) {
  return (
    <div className={cn("flex-1 overflow-auto py-2", className)} {...props}>
      {children}
    </div>
  )
}

interface SidebarNavItemProps extends React.HTMLAttributes<HTMLAnchorElement> {
  active?: boolean;
  href: string;
  icon?: React.ReactNode;
  collapsed?: boolean;
}

export function SidebarNavItem({
  className,
  children,
  active,
  href,
  icon,
  collapsed = false,
  ...props
}: SidebarNavItemProps) {
  return (
    <a
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md py-2.5 text-sm font-medium",
        collapsed ? "justify-center px-2" : "px-4", 
        active 
          ? "bg-accent text-accent-foreground" 
          : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
        className
      )}
      {...props}
    >
      {icon && <span className={cn("h-5 w-5", collapsed && "mx-auto")}>{icon}</span>}
      {!collapsed && <span>{children}</span>}
    </a>
  )
}

interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsed?: boolean;
}

export function SidebarFooter({
  className,
  children,
  collapsed = false,
  ...props
}: SidebarFooterProps) {
  return (
    <div
      className={cn(
        "border-t p-4",
        collapsed && "flex justify-center p-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

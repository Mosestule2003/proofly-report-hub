
import * as React from "react"
import { cn } from "@/lib/utils"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, children, ...props }: SidebarProps) {
  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r bg-background",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarHeader({
  className,
  children,
  ...props
}: SidebarHeaderProps) {
  return (
    <div
      className={cn("flex h-14 items-center border-b px-4", className)}
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
  active?: boolean
  href: string
  icon?: React.ReactNode
}

export function SidebarNavItem({
  className,
  children,
  active,
  href,
  icon,
  ...props
}: SidebarNavItemProps) {
  return (
    <a
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium",
        active 
          ? "bg-accent text-accent-foreground" 
          : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
        className
      )}
      {...props}
    >
      {icon && <span className="h-5 w-5">{icon}</span>}
      <span>{children}</span>
    </a>
  )
}

interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarFooter({
  className,
  children,
  ...props
}: SidebarFooterProps) {
  return (
    <div
      className={cn("border-t p-4", className)}
      {...props}
    >
      {children}
    </div>
  )
}

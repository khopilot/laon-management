import * as React from "react"
import {
  HomeIcon,
  UsersIcon,
  DocumentCheckIcon,
  BanknotesIcon,
  ChartBarIcon,
  CogIcon,
  BuildingOfficeIcon,
  UserCircleIcon,
  ChevronUpIcon,
  BellIcon,
  LogOutIcon
} from "@heroicons/react/24/outline"

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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuth } from '@/hooks/useAuth'
import { useLocation, Link } from 'react-router-dom'

// Navigation data
const data = {
  user: {
    name: "Loan Officer",
    email: "officer@loancare.com",
    avatar: "/avatars/user.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: HomeIcon,
    },
    {
      title: "Clients",
      url: "/clients", 
      icon: UsersIcon,
    },
    {
      title: "Loan Management",
      icon: DocumentCheckIcon,
      items: [
        {
          title: "Applications",
          url: "/applications",
        },
        {
          title: "Active Loans",
          url: "/loans",
        },
      ],
    },
    {
      title: "Payments",
      url: "/payments",
      icon: BanknotesIcon,
    },
    {
      title: "Reports",
      url: "/reports", 
      icon: ChartBarIcon,
    },
  ],
  admin: [
    {
      title: "Administration",
      url: "/admin",
      icon: CogIcon,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth()
  const location = useLocation()

  const filteredNavMain = data.navMain
  const adminNav = user?.staff_role === 'admin' ? data.admin : []

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">LoanCare</span>
            <span className="truncate text-xs text-muted-foreground">
              Management System
            </span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {filteredNavMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                {item.items ? (
                  <SidebarMenuButton asChild>
                    <span className="flex items-center">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </span>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url!}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
                {item.items && (
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton 
                          asChild
                          isActive={location.pathname === subItem.url}
                        >
                          <Link to={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        
        {adminNav.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarMenu>
              {adminNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <UserCircleIcon className="h-8 w-8" />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {user?.staff_role === 'admin' ? 'Administrator' : 'Loan Officer'}
                </span>
                <span className="truncate text-xs">
                  {user?.branch_id || 'BR001'}
                </span>
              </div>
              <ChevronUpIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
} 
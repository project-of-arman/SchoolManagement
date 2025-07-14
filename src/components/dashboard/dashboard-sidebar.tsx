"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { CampusConnectLogo } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Wallet,
  GraduationCap,
  BookOpen,
  Settings,
  LogOut,
  ChevronDown
} from "lucide-react";
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function DashboardSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/applications", label: "Applications", icon: ClipboardList },
    { href: "/dashboard/teachers", label: "Teachers", icon: Users },
    { href: "/dashboard/payments", label: "Fee Payments", icon: Wallet },
    { href: "/dashboard/results", label: "Results", icon: GraduationCap },
    { href: "/dashboard/requests", label: "Certificates", icon: BookOpen },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <CampusConnectLogo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold font-headline text-primary group-data-[collapsible=icon]:hidden">
            CampusConnect
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
         <SidebarMenuItem>
            <Link href="/dashboard/settings" legacyBehavior passHref>
              <SidebarMenuButton isActive={pathname === '/dashboard/settings'} tooltip="Settings">
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
             <Link href="/" legacyBehavior passHref>
                <SidebarMenuButton tooltip="Logout">
                  <LogOut />
                  <span>Logout</span>
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>
        <SidebarSeparator />
        <div className="flex items-center gap-3 p-2">
            <Avatar>
                <AvatarImage src="https://placehold.co/100x100.png" alt="School Owner" data-ai-hint="person" />
                <AvatarFallback>SO</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="font-semibold text-sm">Sunrise School</span>
                <span className="text-xs text-muted-foreground">owner@sunrise.com</span>
            </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

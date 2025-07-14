"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
} from "lucide-react";
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from "@/hooks/use-auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";

interface SchoolData {
    name: string;
    ownerEmail: string;
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [schoolData, setSchoolData] = useState<SchoolData | null>(null);

  useEffect(() => {
    if (user) {
        const fetchSchoolData = async () => {
            const schoolDocRef = doc(db, "schools", user.uid);
            const schoolDoc = await getDoc(schoolDocRef);
            if (schoolDoc.exists()) {
                setSchoolData(schoolDoc.data() as SchoolData);
            }
        };
        fetchSchoolData();
    }
  }, [user]);


  const navItems = [
    { href: "/school", label: "Dashboard", icon: LayoutDashboard },
    { href: "/school/applications", label: "Applications", icon: ClipboardList },
    { href: "/school/teachers", label: "Teachers", icon: Users },
    { href: "/school/payments", label: "Fee Payments", icon: Wallet },
    { href: "/school/results", label: "Results", icon: GraduationCap },
    { href: "/school/requests", label: "Certificates", icon: BookOpen },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };
  
  const getInitials = (name: string = "") => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase() || 'S';
  }

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
              <SidebarMenuButton
                  as={Link}
                  href={item.href}
                  isActive={pathname === item.href || (item.href !== "/school" && pathname.startsWith(item.href))}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
         <SidebarMenuItem>
            <SidebarMenuButton as={Link} href="/school/settings" isActive={pathname === '/school/settings'} tooltip="Settings">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Logout" onClick={handleLogout}>
                <LogOut />
                <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        <SidebarSeparator />
        <div className="flex items-center gap-3 p-2">
            <Avatar>
                <AvatarImage src={user?.photoURL || `https://placehold.co/100x100.png`} alt="School Owner" data-ai-hint="person" />
                <AvatarFallback>{schoolData ? getInitials(schoolData.name) : '...'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="font-semibold text-sm">{schoolData ? schoolData.name : "Loading..."}</span>
                <span className="text-xs text-muted-foreground">{schoolData ? schoolData.ownerEmail : "..."}</span>
            </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

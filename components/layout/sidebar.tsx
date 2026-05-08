"use strict";

import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  DoorOpen,
  Users2,
  Calendar,
  ClipboardList,
  BarChart3,
  Settings,
  Database,
  FlaskConical,
} from "lucide-react";
import Link from "next/link";

const menuItems = [
  { icon: LayoutDashboard, label: "لوحة القيادة", href: "/" },
  { icon: Users, label: "الأساتذة", href: "/professors" },
  { icon: BookOpen, label: "المواد", href: "/courses" },
  { icon: DoorOpen, label: "القاعات", href: "/rooms" },
  { icon: Users2, label: "المجموعات", href: "/groups" },
  { icon: Calendar, label: "الجدول", href: "/schedule" },
  { icon: ClipboardList, label: "التعيينات", href: "/assignments" },
  { icon: BarChart3, label: "حجم العمل", href: "/workload" },
  { icon: Database, label: "السنوات الأكاديمية", href: "/academic-years" },
  { icon: Settings, label: "الإعدادات", href: "/settings" },
  { icon: FlaskConical, label: "صندوق الرمل", href: "/sandbox" },
];

export function Sidebar() {
  return (
    <ShadcnSidebar side="right">
      <SidebarHeader className="p-4 border-b">
        <h2 className="text-xl font-bold text-primary">جدول 2.0</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>القائمة الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={
                      <Link href={item.href} className="flex items-center gap-2" />
                    }
                    tooltip={item.label}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <div className="text-xs text-muted-foreground text-center">
          إصدار 2.0.0
        </div>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Home,
  UserRound,
  BookOpen,
  DoorOpen,
  Users,
  Calendar,
  Link as LinkIcon,
  Clock,
  BarChart3,
  GraduationCap,
  FlaskConical,
  Settings,
  LogOut,
  ChevronRight,
  MoreHorizontal,
  LayoutDashboard,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const menuGroups = [
  {
    label: "الأساسي",
    items: [
      { title: "لوحة التحكم", href: "/dashboard", icon: LayoutDashboard },
      { title: "الجدول", href: "/dashboard/schedule", icon: Calendar },
    ],
  },
  {
    label: "إدارة البيانات",
    items: [
      { title: "الأساتذة", href: "/dashboard/professors", icon: UserRound },
      { title: "المواد", href: "/dashboard/courses", icon: BookOpen },
      { title: "القاعات", href: "/dashboard/rooms", icon: DoorOpen },
      { title: "المجموعات", href: "/dashboard/groups", icon: Users },
    ],
  },
  {
    label: "العمليات",
    items: [
      { title: "التوزيع", href: "/dashboard/assignments", icon: LinkIcon },
      { title: "الحصص الإضافية", href: "/dashboard/sessions", icon: Clock },
      { title: "عبء العمل", href: "/dashboard/workload", icon: BarChart3 },
    ],
  },
  {
    label: "الإعدادات",
    items: [
      { title: "السنوات الدراسية", href: "/dashboard/academic-years", icon: GraduationCap },
      { title: "السيناريوهات", href: "/dashboard/sandbox", icon: FlaskConical },
      { title: "الإعدادات", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <Sidebar side="right" collapsible="icon" className="border-l bg-white dark:bg-slate-900 shadow-xl">
      <SidebarHeader className="h-16 flex items-center px-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Calendar className="text-white h-6 w-6" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden animate-in fade-in duration-300">
            <span className="text-xl font-black text-slate-900 dark:text-white leading-none">جدول</span>
            <span className="text-xs font-bold text-blue-600">الإصدار الثاني</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        {menuGroups.map((group, idx) => (
          <SidebarGroup key={idx}>
            <SidebarGroupLabel className="px-4 text-xs font-black uppercase tracking-widest text-slate-400 mb-2 group-data-[collapsible=icon]:hidden">
              {group.label}
            </SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={
                        <Link href={item.href} className={`
                          flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                          ${isActive 
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700" 
                            : "text-slate-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:bg-slate-800 hover:text-blue-600"}
                        `}>
                          <item.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-current"}`} />
                          <span className="font-bold group-data-[collapsible=icon]:hidden">{item.title}</span>
                          {isActive && <ChevronRight className="mr-auto h-4 w-4 group-data-[collapsible=icon]:hidden" />}
                        </Link>
                      }
                      isActive={isActive}
                      tooltip={item.title}
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
            {idx < menuGroups.length - 1 && <SidebarSeparator className="my-4 mx-4 opacity-50" />}
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t bg-slate-50/50 dark:bg-slate-900/50">
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <SidebarMenuButton className="h-14 w-full flex items-center gap-3 px-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 shadow-sm border border-transparent hover:border-slate-200 transition-all">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                {session?.user?.name?.charAt(0) || "U"}
              </div>
              <div className="flex flex-col items-start overflow-hidden group-data-[collapsible=icon]:hidden animate-in fade-in duration-300">
                <span className="text-sm font-black text-slate-800 dark:text-white truncate w-full">
                  {session?.user?.name || "المستخدم"}
                </span>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">
                  {(session?.user as any)?.role || "VIEWER"}
                </span>
              </div>
              <MoreHorizontal className="mr-auto h-4 w-4 text-slate-400 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          } />
          <DropdownMenuContent side="top" align="end" className="w-56 p-2 rounded-xl mb-2">
            <DropdownMenuItem className="flex items-center gap-2 py-2 cursor-pointer rounded-lg">
              <UserRound className="h-4 w-4" />
              <span>الملف الشخصي</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 py-2 cursor-pointer rounded-lg">
              <Settings className="h-4 w-4" />
              <span>إعدادات الحساب</span>
            </DropdownMenuItem>
            <SidebarSeparator className="my-1" />
            <DropdownMenuItem 
              onClick={() => signOut()}
              className="flex items-center gap-2 py-2 cursor-pointer rounded-lg text-red-600 focus:bg-red-50 focus:text-red-700 font-bold"
            >
              <LogOut className="h-4 w-4" />
              <span>تسجيل الخروج</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

import { auth, signOut } from "@/auth";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb } from "./breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Bell, LogOut, Settings, User as UserIcon, Calendar } from "lucide-react";
import db from "@/lib/db";

export async function Header() {
  const session = await auth();
  const semesters = await (db as any).semester.findMany({
    where: { isCurrent: true || false }, // Fetch all for selection
    include: { academicYear: true }
  });

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white/80 backdrop-blur-md px-4 md:px-6 shadow-sm rtl" dir="rtl">
      <SidebarTrigger />
      
      <div className="flex-1">
        <Breadcrumb />
      </div>

      <div className="flex items-center gap-3">
        {/* Semester Selector */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          <Calendar className="h-4 w-4 text-slate-500" />
          <select className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer">
            {semesters.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.name} - {s.academicYear.name}
              </option>
            ))}
          </select>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative text-slate-600 hover:bg-slate-100">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="flex items-center gap-3 px-2 hover:bg-slate-100 rounded-xl transition-all">
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-sm font-bold text-slate-800">{session?.user?.name || "مستخدم"}</span>
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                    {(session?.user as any)?.role || "VIEWER"}
                  </span>
                </div>
                <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl mt-2">
            <DropdownMenuLabel className="font-bold text-slate-800">حسابي</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center gap-2 py-2 cursor-pointer rounded-lg">
              <UserIcon className="h-4 w-4" />
              <span>الملف الشخصي</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 py-2 cursor-pointer rounded-lg">
              <Settings className="h-4 w-4" />
              <span>الإعدادات</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}>
              <button type="submit" className="w-full flex items-center gap-2 py-2 px-2 text-red-600 hover:bg-red-50 cursor-pointer rounded-lg transition-colors text-sm font-bold">
                <LogOut className="h-4 w-4" />
                <span>تسجيل الخروج</span>
              </button>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

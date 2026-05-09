import { auth } from "@/auth";
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
import { Bell, Moon, Sun, Search, Calendar, ChevronDown } from "lucide-react";
import db from "@/lib/db";

export async function Header() {
  const session = await auth();
  
  // Fetch current semesters for the global context selector
  const semesters = await db.semester.findMany({
    include: { academicYear: true },
    orderBy: { startDate: 'desc' }
  });

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white/70 backdrop-blur-xl px-4 md:px-6 shadow-sm rtl" dir="rtl">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="hover:bg-slate-100 rounded-lg transition-colors" />
        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
        <Breadcrumb />
      </div>

      <div className="flex-1 flex justify-center">
        {/* Institutional Identifier or Search */}
        <div className="hidden lg:flex items-center gap-3 bg-slate-100/50 border border-slate-200 rounded-2xl px-4 py-1.5 min-w-[300px] group focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-600" />
          <input 
            type="text" 
            placeholder="بحث سريع..." 
            className="bg-transparent border-none outline-none text-sm w-full text-slate-700 font-medium"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Semester Selection */}
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="outline" className="hidden sm:flex items-center gap-2 bg-white border-slate-200 rounded-xl px-3 h-10 hover:bg-slate-50 transition-all">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div className="flex flex-col items-start leading-none text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase">الفصل الدراسي</span>
                <span className="text-xs font-bold text-slate-700">
                  {semesters.find(s => s.isCurrent)?.name || "اختر الفصل"}
                </span>
              </div>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </Button>
          } />
          <DropdownMenuContent align="center" className="w-64 p-2 rounded-xl mt-2">
            <DropdownMenuLabel className="font-black text-slate-400 text-xs uppercase px-2 mb-1">الفصول الدراسية المتاحة</DropdownMenuLabel>
            {semesters.map((s) => (
              <DropdownMenuItem key={s.id} className="flex flex-col items-start gap-0.5 py-2 px-3 rounded-lg cursor-pointer">
                <span className="text-sm font-bold text-slate-800">{s.name} - {s.academicYear.year}</span>
                <span className="text-[10px] text-slate-500">{new Date(s.startDate!).toLocaleDateString('ar-DZ')} - {new Date(s.endDate!).toLocaleDateString('ar-DZ')}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        {/* Action Icons */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-slate-600 hover:bg-slate-100 rounded-xl">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-slate-600 hover:bg-slate-100 rounded-xl">
            <Sun className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile User Profile */}
        <div className="md:hidden flex items-center justify-center w-10 h-10 bg-blue-600 rounded-xl text-white font-bold shadow-lg shadow-blue-200">
          {session?.user?.name?.charAt(0) || "U"}
        </div>
      </div>
    </header>
  );
}

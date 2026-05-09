import { auth } from "@/auth";
import { DashboardCharts } from "@/components/dashboard/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  BookOpen, 
  DoorOpen, 
  Users2, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Upload, 
  Printer, 
  FileBarChart,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import db from "@/lib/db";

async function getDashboardData() {
  const [professorsCount, coursesCount, roomsCount, groupsCount] = await Promise.all([
    db.professor.count(),
    db.course.count(),
    db.room.count(),
    db.group.count(),
  ]);

  const assignments = await db.assignment.findMany({
    select: { dayOfWeek: true, sessionType: true }
  });

  const days = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"];
  const weeklyDistribution = days.map((day, index) => {
    const dayIndex = index + 1;
    const dayAssignments = assignments.filter(a => a.dayOfWeek === dayIndex);
    return {
      name: day,
      lecture: dayAssignments.filter(a => a.sessionType === "lecture").length,
      td: dayAssignments.filter(a => a.sessionType === "td").length,
      tp: dayAssignments.filter(a => a.sessionType === "tp").length,
    };
  });

  const profsWithAssignments = await db.professor.findMany({
    take: 10,
    include: {
      _count: { select: { assignments: true } }
    },
    orderBy: {
      assignments: { _count: 'desc' }
    }
  });

  const workload = profsWithAssignments.map(p => ({
    name: p.name,
    hours: p._count.assignments * 1.5,
    max: p.maxHours || 18,
  }));

  return {
    counts: { professors: professorsCount, courses: coursesCount, rooms: roomsCount, groups: groupsCount },
    weeklyDistribution,
    workload
  };
}

export default async function DashboardPage() {
  const session = await auth();
  const data = await getDashboardData();

  const kpis = [
    { title: "الأساتذة", value: data.counts.professors, trend: "+3 هذا الفصل", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "المواد", value: data.counts.courses, trend: "98 نشطة", icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "القاعات", value: data.counts.rooms, trend: "28 متاحة", icon: DoorOpen, color: "text-orange-600", bg: "bg-orange-50" },
    { title: "المجموعات", value: data.counts.groups, trend: "2400 طالب", icon: Users2, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 rtl" dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">أهلاً بك، {session?.user?.name || "المدير"} 👋</h1>
          <p className="text-slate-500 font-medium mt-1">إليك ملخص شامل لحالة الجداول الدراسية لهذا الأسبوع.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-2xl gap-2 font-bold bg-white shadow-sm hover:bg-slate-50 transition-all">
            <Upload className="h-4 w-4" />
            استيراد بيانات
          </Button>
          <Button className="rounded-2xl gap-2 font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95">
            <Plus className="h-4 w-4" />
            إضافة حصة جديدة
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <Card key={i} className="rounded-3xl shadow-xl shadow-slate-100 border-none bg-white hover:scale-[1.02] transition-transform duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className={`${kpi.bg} p-3 rounded-2xl`}>
                  <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-full uppercase tracking-wider">
                  تحليل مباشر
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{kpi.title}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-black text-slate-900">{kpi.value}</h3>
                  <span className="text-xs font-bold text-emerald-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {kpi.trend}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <DashboardCharts data={data.weeklyDistribution} workload={data.workload} />

      {/* Smart Alerts & Quick Info */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Weekly Calendar Mini View */}
        <Card className="lg:col-span-2 rounded-3xl shadow-xl shadow-slate-100 border-slate-100 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50">
            <div>
              <CardTitle className="text-lg font-black text-slate-800">الجدول الأسبوعي الحالي</CardTitle>
              <CardDescription>عرض سريع للحصص المجدولة هذا الأسبوع</CardDescription>
            </div>
            <Link href="/dashboard/schedule">
              <Button variant="ghost" size="sm" className="text-blue-600 font-bold gap-1 hover:bg-blue-50">
                الجدول الكامل
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
             <div className="h-[200px] flex items-center justify-center text-slate-400 bg-slate-50/20">
                <div className="text-center space-y-2">
                  <CalendarDays className="h-10 w-10 mx-auto opacity-20" />
                  <p className="font-bold">نظام العرض المصغر قيد التجهيز</p>
                </div>
             </div>
          </CardContent>
        </Card>

        {/* Alerts & Actions */}
        <div className="space-y-6">
          <Card className="rounded-3xl border-orange-100 bg-orange-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black text-orange-800 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                تنبيهات النظام
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-orange-100 shadow-sm">
                 <span className="text-sm font-bold text-slate-700">صراعات في الجدول</span>
                 <span className="bg-orange-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">02 صراع</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-orange-100 shadow-sm">
                 <span className="text-sm font-bold text-slate-700">قاعات غير مخصصة</span>
                 <span className="bg-orange-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">05 جلسة</span>
              </div>
              <div className="p-4 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-100">
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-xs font-black uppercase">اكتمال الفصل الحالي</span>
                   <span className="text-xs font-black">85%</span>
                 </div>
                 <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white w-[85%] rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]"></div>
                 </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-24 rounded-3xl flex flex-col gap-2 font-black text-slate-600 bg-white border-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm">
              <Printer className="h-6 w-6" />
              طباعة الجدول
            </Button>
            <Button variant="outline" className="h-24 rounded-3xl flex flex-col gap-2 font-black text-slate-600 bg-white border-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm">
              <FileBarChart className="h-6 w-6" />
              تقرير الأعباء
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

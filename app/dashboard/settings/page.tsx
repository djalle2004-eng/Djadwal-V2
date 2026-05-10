import Link from "next/link";
import { 
  Printer, 
  Calendar, 
  Database, 
  Users, 
  ShieldCheck, 
  Bell, 
  ChevronLeft,
  Settings as SettingsIcon,
  Languages
} from "lucide-react";

export default function SettingsPage() {
  const settingsGroups = [
    {
      title: "إعدادات المخرجات",
      items: [
        {
          title: "الطباعة وتصدير PDF",
          description: "تخصيص الشعارات، الهوامش، الملاحظات الرسمية وتنسيق الجداول.",
          href: "/dashboard/settings/print",
          icon: <Printer className="h-6 w-6 text-blue-600" />,
          color: "bg-blue-50"
        },
        {
          title: "تصدير Excel",
          description: "تنسيق التقارير الإحصائية وعبء العمل الساعي.",
          href: "#",
          icon: <Database className="h-6 w-6 text-emerald-600" />,
          color: "bg-emerald-50"
        }
      ]
    },
    {
      title: "النظام والبيانات",
      items: [
        {
          title: "السنوات الدراسية",
          description: "إدارة الفصول، التواريخ الهامة، والسنوات الأكاديمية النشطة.",
          href: "/dashboard/academic-years",
          icon: <Calendar className="h-6 w-6 text-purple-600" />,
          color: "bg-purple-50"
        },
        {
          title: "إدارة المستخدمين",
          description: "التحكم في الصلاحيات، الأدوار، والوصول إلى لوحة التحكم.",
          href: "#",
          icon: <Users className="h-6 w-6 text-orange-600" />,
          color: "bg-orange-50"
        }
      ]
    },
    {
      title: "التفضيلات العامة",
      items: [
        {
          title: "اللغة والمنطقة",
          description: "تغيير لغة الواجهة، تنسيق التاريخ، والمنطقة الزمنية.",
          href: "#",
          icon: <Languages className="h-6 w-6 text-cyan-600" />,
          color: "bg-cyan-50"
        },
        {
          title: "الإشعارات",
          description: "تخصيص تنبيهات التعارضات وتذكيرات الامتحانات.",
          href: "#",
          icon: <Bell className="h-6 w-6 text-rose-600" />,
          color: "bg-rose-50"
        }
      ]
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="bg-slate-900 p-3 rounded-2xl shadow-lg">
          <SettingsIcon className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">مركز الإعدادات</h1>
          <p className="text-slate-500 font-medium mt-1">إدارة تكوين النظام، الهوية البصرية، وتفضيلات المستخدم.</p>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="space-y-12">
        {settingsGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 border-r-4 border-slate-900 pr-4 leading-none">
              {group.title}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {group.items.map((item, iIdx) => (
                <Link 
                  key={iIdx} 
                  href={item.href}
                  className="group block bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Hover effect background */}
                  <div className="absolute inset-0 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative flex items-start gap-5">
                    <div className={`${item.color} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500`}>
                      {item.icon}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h3>
                        <ChevronLeft className="h-5 w-5 text-slate-300 group-hover:text-slate-900 transform group-hover:-translate-x-1 transition-all" />
                      </div>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="pt-10 border-t border-slate-100">
        <div className="bg-slate-50 p-6 rounded-3xl flex items-center justify-between border border-dashed border-slate-200">
          <div className="flex items-center gap-4">
            <ShieldCheck className="h-6 w-6 text-slate-400" />
            <p className="text-slate-500 text-sm font-medium">إصدار النظام: <span className="font-bold text-slate-900">V2.4.0 (Stable)</span></p>
          </div>
          <p className="text-slate-400 text-xs">آخر تحديث للأمان: منذ يومين</p>
        </div>
      </div>
    </div>
  );
}

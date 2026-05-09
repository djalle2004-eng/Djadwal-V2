import Link from "next/link";
import { ArrowLeft, Calendar, Shield, Zap, CheckCircle, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col rtl" dir="rtl">
      {/* Header/Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Calendar className="text-white h-6 w-6" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">جدول <span className="text-blue-600">V2</span></span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-slate-600 font-semibold hover:text-blue-600 transition-colors">دخول</Link>
            <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-95">ابدأ الآن</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-100/50 rounded-full blur-3xl -z-10 opacity-50"></div>
          
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-center lg:text-right animate-in slide-in-from-right duration-700">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold">
                <Zap className="h-4 w-4" />
                الإصدار الثاني المطور أصبح متاحاً الآن
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1]">
                نظم جدولك الجامعي <br />
                <span className="text-blue-600">بذكاء وبساطة</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
                أقوى منصة لإدارة الجداول الدراسية، توزيع القاعات، وتنظيم الساعات الإضافية. صُمم خصيصاً لتلبية احتياجات الأقسام والجامعات العصرية.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-2xl font-bold shadow-2xl shadow-blue-200 transition-all flex items-center justify-center gap-2">
                  دخول لوحة التحكم
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                  <div className="flex -space-x-2 rtl:space-x-reverse">
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"></div>
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-300"></div>
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-400"></div>
                  </div>
                  <span className="text-sm font-medium text-slate-500 font-bold">+50 مستخدم نشط</span>
                </div>
              </div>
            </div>

            <div className="relative animate-in zoom-in duration-1000">
              <div className="relative bg-white rounded-3xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100">
                <div className="bg-slate-50 rounded-2xl aspect-[4/3] flex items-center justify-center overflow-hidden">
                   {/* Placeholder for dashboard preview or image */}
                   <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 p-8 flex flex-col justify-center gap-4 text-white">
                      <div className="h-4 w-3/4 bg-white/20 rounded-full animate-pulse"></div>
                      <div className="h-4 w-1/2 bg-white/20 rounded-full animate-pulse delay-75"></div>
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="h-20 bg-white/10 rounded-xl"></div>
                        <div className="h-20 bg-white/10 rounded-xl"></div>
                        <div className="h-20 bg-white/10 rounded-xl"></div>
                      </div>
                      <div className="mt-8 text-center">
                        <span className="text-xl font-bold opacity-80">Dashboard Preview</span>
                      </div>
                   </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-400 rounded-3xl rotate-12 -z-10 opacity-20"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-600 rounded-full -z-10 opacity-10 blur-2xl"></div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl font-black text-slate-900">لماذا تختار جدول V2؟</h2>
              <p className="text-slate-500 max-w-2xl mx-auto font-medium italic">تم تطويره ليكون الأسرع والأكثر دقة في إدارة الموارد الأكاديمية</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "سرعة فائقة", desc: "نظام مبني على أحدث التقنيات لضمان تجربة مستخدم سريعة وسلسة.", icon: Zap, color: "text-orange-500", bg: "bg-orange-50" },
                { title: "أمان عالي", desc: "تشفير كامل للبيانات مع نظام صلاحيات دقيق لكل مستوى من المستخدمين.", icon: Shield, color: "text-green-500", bg: "bg-green-50" },
                { title: "إدارة متكاملة", desc: "كل ما تحتاجه من إدارة الأساتذة، القاعات، والمواد في مكان واحد.", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
              ].map((f, i) => (
                <div key={i} className="p-8 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all group">
                  <div className={`w-14 h-14 ${f.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <f.icon className={`h-7 w-7 ${f.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{f.title}</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-80">
            <Calendar className="h-6 w-6" />
            <span className="text-xl font-black">جدول V2</span>
          </div>
          <p className="text-slate-400 text-sm font-bold tracking-wide">© 2026 جميع الحقوق محفوظة لجامعة الوادي</p>
          <div className="flex gap-6 text-slate-400">
            <Link href="#" className="hover:text-white transition-colors">الخصوصية</Link>
            <Link href="#" className="hover:text-white transition-colors">الشروط</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

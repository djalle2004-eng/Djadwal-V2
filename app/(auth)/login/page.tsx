"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Mail, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("حدث خطأ ما، يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 rtl" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 rotate-3 hover:rotate-0 transition-transform duration-300">
              <span className="text-white text-3xl font-bold">جدول</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">تسجيل الدخول</h1>
            <p className="text-slate-500 mt-2 text-sm">مرحباً بك مجدداً في نظام إدارة الجداول</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-md flex items-center gap-3 animate-in slide-in-from-right duration-300">
                <AlertCircle className="text-red-500 h-5 w-5 shrink-0" />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block mr-1">البريد الإلكتروني</label>
              <div className="relative group">
                <Mail className="absolute right-3 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="email"
                  required
                  className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-800"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center mr-1">
                <label className="text-sm font-semibold text-slate-700">كلمة المرور</label>
                <Link href="/reset-password" title="reset_password_link" className="text-xs text-blue-600 hover:underline">نسيت كلمة المرور؟</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute right-3 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="password"
                  required
                  className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-800"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mr-1">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer select-none">تذكرني</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                "دخول"
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            ليس لديك حساب؟ اتصل بمسؤول النظام
          </div>
        </div>
      </div>
    </div>
  );
}

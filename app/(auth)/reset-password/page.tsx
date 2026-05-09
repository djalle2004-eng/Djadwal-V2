"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Mail, Lock, CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [step, setStep] = useState(token ? 2 : 1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.message || "حدث خطأ في إرسال البريد");
      }
    } catch (err) {
      setError("حدث خطأ في الخادم");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("كلمات المرور غير متطابقة");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "PUT",
        body: JSON.stringify({ token, password }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        const data = await res.json();
        setError(data.message || "الرابط غير صالح أو انتهت صلاحيته");
      }
    } catch (err) {
      setError("حدث خطأ في الخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 rtl" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              {step === 1 ? <Mail className="text-blue-600 h-8 w-8" /> : <Lock className="text-blue-600 h-8 w-8" />}
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">
            {step === 1 ? "استعادة كلمة المرور" : "تعيين كلمة مرور جديدة"}
          </h1>
          <p className="text-slate-500 text-center text-sm mb-8">
            {step === 1 
              ? "أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور" 
              : "يرجى إدخال كلمة المرور الجديدة والقوية لحسابك"}
          </p>

          {success ? (
            <div className="bg-green-50 border border-green-200 p-6 rounded-xl text-center space-y-4 animate-in zoom-in duration-300">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <p className="text-green-800 font-medium">
                {step === 1 
                  ? "تم إرسال رابط الاستعادة إلى بريدك الإلكتروني بنجاح" 
                  : "تم تحديث كلمة المرور بنجاح! سيتم توجيهك لصفحة الدخول..."}
              </p>
              <Link href="/login" className="block text-blue-600 hover:underline text-sm font-semibold">
                العودة لصفحة الدخول
              </Link>
            </div>
          ) : (
            <form onSubmit={step === 1 ? handleRequestReset : handleUpdatePassword} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-md flex items-center gap-3">
                  <AlertCircle className="text-red-500 h-5 w-5 shrink-0" />
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              {step === 1 ? (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 block mr-1">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-3.5 h-5 w-5 text-slate-400" />
                    <input
                      type="email"
                      required
                      className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="example@mail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block mr-1">كلمة المرور الجديدة</label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-3.5 h-5 w-5 text-slate-400" />
                      <input
                        type="password"
                        required
                        className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 block mr-1">تأكيد كلمة المرور</label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-3.5 h-5 w-5 text-slate-400" />
                      <input
                        type="password"
                        required
                        className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : step === 1 ? "إرسال رابط الاستعادة" : "تحديث كلمة المرور"}
              </button>

              <Link href="/login" className="flex items-center justify-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium">
                <ArrowRight className="h-4 w-4" />
                العودة لتسجيل الدخول
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

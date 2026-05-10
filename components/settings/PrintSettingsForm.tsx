"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LogoUploader } from "./LogoUploader";
import { PrintPreview } from "./PrintPreview";
import { toast } from "sonner";

export function PrintSettingsForm() {
  const [settings, setSettings] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings/print")
      .then(res => res.json())
      .then(data => {
        setSettings(data || {});
        setIsLoading(false);
      });
  }, []);

  const handleChange = (field: string, value: string) => {
    setSettings((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings/print", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) toast.success("تم حفظ إعدادات الطباعة بنجاح");
      else throw new Error("فشل الحفظ");
    } catch (err) {
      toast.error("حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">جاري تحميل الإعدادات...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" dir="rtl">
      <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
        <h2 className="text-xl font-bold border-b pb-4">معلومات وتصميم المطبوعات</h2>
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border">
            <LogoUploader 
              label="شعار الجامعة (يمين)" 
              value={settings.universityLogo} 
              onChange={(val: string) => handleChange("universityLogo", val)} 
            />
            <LogoUploader 
              label="شعار الكلية (يسار)" 
              value={settings.facultyLogo} 
              onChange={(val: string) => handleChange("facultyLogo", val)} 
            />
          </div>

          <div className="space-y-4">
            <div>
              <Label>اسم الجامعة</Label>
              <Input 
                value={settings.universityName || ""} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("universityName", e.target.value)} 
                placeholder="مثال: جامعة الجزائر 1"
              />
            </div>
            <div>
              <Label>اسم الكلية / القسم</Label>
              <Input 
                value={settings.facultyName || ""} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("facultyName", e.target.value)} 
                placeholder="مثال: كلية العلوم الدقيقة"
              />
            </div>
            <div>
              <Label>ملاحظات الرأس (Header)</Label>
              <Textarea 
                value={settings.headerNotes || ""} 
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange("headerNotes", e.target.value)} 
                placeholder="تظهر تحت اسم الكلية..."
                rows={2}
              />
            </div>
            <div>
              <Label>ملاحظات التذييل (Footer)</Label>
              <Textarea 
                value={settings.footerNotes || ""} 
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange("footerNotes", e.target.value)} 
                placeholder="تظهر أسفل الجدول..."
                rows={2}
              />
            </div>
            <div>
              <Label>ملاحظات إعلان الفروض الافتراضية</Label>
              <Textarea 
                value={settings.examNotes || ""} 
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange("examNotes", e.target.value)} 
                placeholder="الغياب غير المبرر يؤدي إلى الصفر..."
                rows={3}
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-lg" disabled={isSaving}>
            {isSaving ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center justify-between">
          <span>المعاينة المباشرة (Live Preview)</span>
          <span className="text-xs font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded">يتم التحديث تلقائياً</span>
        </h2>
        <PrintPreview settings={settings} />
      </div>
    </div>
  );
}

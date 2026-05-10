import { PrintSettingsForm } from "@/components/settings/PrintSettingsForm";

export const metadata = {
  title: "إعدادات الطباعة | Djadwal",
  description: "إعدادات طباعة وتصدير الجداول",
};

export default function PrintSettingsPage() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">إعدادات الطباعة وتصدير PDF</h1>
        <p className="text-gray-500 mt-2">تخصيص الهوية البصرية والملاحظات الافتراضية للجداول والإعلانات المستخرجة (شعارات، نصوص، وهوامش).</p>
      </div>
      
      <PrintSettingsForm />
    </div>
  );
}

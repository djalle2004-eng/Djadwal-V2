"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// Smart Wizard Form
export function AssignmentForm({ initialData, onSubmit, onCancel, isSaving }: any) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>(initialData || {
    specialization: "",
    groupId: "",
    courseId: "",
    professorId: "",
    dayOfWeek: "",
    startTime: "",
    endTime: "",
    roomId: "",
  });

  const [groups, setGroups] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [professors, setProfessors] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    // Mocking API calls for the smart form since we don't have dedicated specific APIs for options
    // In a real scenario, these would fetch from /api/groups?specialization=X etc.
    fetch("/api/groups").then(res => res.json()).then(setGroups).catch(() => {});
    fetch("/api/courses").then(res => res.json()).then(setCourses).catch(() => {});
    fetch("/api/professors").then(res => res.json()).then(setProfessors).catch(() => {});
    fetch("/api/rooms").then(res => res.json()).then(setRooms).catch(() => {});
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => setStep((s) => Math.min(s + 1, 6));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate conflicts before saving via our validate API
    try {
      const res = await fetch("/api/schedule/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: initialData?.id,
          professorId: formData.professorId,
          groupId: formData.groupId,
          roomId: formData.roomId,
          dayOfWeek: Number(formData.dayOfWeek),
          startTime: formData.startTime,
          endTime: formData.endTime,
        })
      });
      const data = await res.json();
      if (data.hasConflict) {
        toast.error("تم اكتشاف تعارض", {
          description: data.conflicts.join("\n")
        });
        return;
      }
      
      onSubmit({
        ...formData,
        dayOfWeek: Number(formData.dayOfWeek)
      });
    } catch (err) {
      toast.error("فشل في التحقق من التعارضات");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-sm border" dir="rtl">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">{initialData ? "تعديل التوزيع" : "إضافة توزيع جديد"}</h2>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">الخطوة {step} من 6</span>
      </div>

      <div className="space-y-4">
        {step === 1 && (
          <div>
            <Label>التخصص</Label>
            <Input 
              value={formData.specialization} 
              onChange={(e) => handleChange("specialization", e.target.value)} 
              placeholder="اكتب التخصص لتحميل المجموعات..."
            />
            <p className="text-xs text-gray-500 mt-2">اختيار التخصص يحدد المجموعات المتاحة في الخطوة التالية.</p>
          </div>
        )}

        {step === 2 && (
          <div>
            <Label>المجموعة</Label>
            <Select value={formData.groupId} onValueChange={(val) => handleChange("groupId", val)}>
              <SelectTrigger><SelectValue placeholder="اختر المجموعة" /></SelectTrigger>
              <SelectContent>
                {groups.map((g: any) => (
                  <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {step === 3 && (
          <div>
            <Label>المادة</Label>
            <Select value={formData.courseId} onValueChange={(val) => handleChange("courseId", val)}>
              <SelectTrigger><SelectValue placeholder="اختر المادة" /></SelectTrigger>
              <SelectContent>
                {courses.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {step === 4 && (
          <div>
            <Label>الأستاذ</Label>
            <Select value={formData.professorId} onValueChange={(val) => handleChange("professorId", val)}>
              <SelectTrigger><SelectValue placeholder="اختر الأستاذ" /></SelectTrigger>
              <SelectContent>
                {professors.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <div>
              <Label>اليوم</Label>
              <Select value={formData.dayOfWeek?.toString()} onValueChange={(val) => handleChange("dayOfWeek", val)}>
                <SelectTrigger><SelectValue placeholder="اختر اليوم" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">الأحد</SelectItem>
                  <SelectItem value="1">الإثنين</SelectItem>
                  <SelectItem value="2">الثلاثاء</SelectItem>
                  <SelectItem value="3">الأربعاء</SelectItem>
                  <SelectItem value="4">الخميس</SelectItem>
                  <SelectItem value="5">الجمعة</SelectItem>
                  <SelectItem value="6">السبت</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>وقت البداية</Label>
                <Input type="time" value={formData.startTime} onChange={(e) => handleChange("startTime", e.target.value)} />
              </div>
              <div>
                <Label>وقت النهاية</Label>
                <Input type="time" value={formData.endTime} onChange={(e) => handleChange("endTime", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>القاعة</Label>
              <Select value={formData.roomId} onValueChange={(val) => handleChange("roomId", val)}>
                <SelectTrigger><SelectValue placeholder="اختر القاعة (مقترحة بناءً على الوقت)" /></SelectTrigger>
                <SelectContent>
                  {rooms.map((r: any) => (
                    <SelectItem key={r.id} value={r.id}>{r.name} - سعة {r.capacity}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="p-4 bg-gray-50 rounded-md border text-sm">
            <h3 className="font-bold mb-2">مراجعة البيانات قبل الحفظ:</h3>
            <ul className="space-y-1 text-gray-700">
              <li><strong>المادة:</strong> {courses.find((c: any) => c.id === formData.courseId)?.name}</li>
              <li><strong>الأستاذ:</strong> {professors.find((p: any) => p.id === formData.professorId)?.name}</li>
              <li><strong>المجموعة:</strong> {groups.find((g: any) => g.id === formData.groupId)?.name}</li>
              <li><strong>اليوم:</strong> {formData.dayOfWeek}</li>
              <li><strong>الوقت:</strong> {formData.startTime} - {formData.endTime}</li>
              <li><strong>القاعة:</strong> {rooms.find((r: any) => r.id === formData.roomId)?.name}</li>
            </ul>
            <p className="mt-4 text-xs text-blue-600 font-medium">عند النقر على حفظ، سيتم التحقق من التعارضات تلقائياً عبر خدمة كشف التعارضات الذكية.</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        {step > 1 ? (
          <Button type="button" variant="outline" onClick={handlePrev}>السابق</Button>
        ) : (
          <Button type="button" variant="ghost" onClick={onCancel}>إلغاء</Button>
        )}
        
        {step < 6 ? (
          <Button type="button" onClick={handleNext}>التالي</Button>
        ) : (
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "جاري الحفظ..." : "حفظ التوزيع"}
          </Button>
        )}
      </div>
    </form>
  );
}

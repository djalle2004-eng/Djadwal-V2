"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateProfessor, useUpdateProfessor } from "@/lib/hooks/use-professors";
import { cn } from "@/lib/utils";
import { Loader2, UserRound, Briefcase } from "lucide-react";

const schema = z.object({
  firstName: z.string().min(2, "الاسم الأول مطلوب (حرفان على الأقل)"),
  lastName: z.string().min(2, "اسم العائلة مطلوب (حرفان على الأقل)"),
  email: z.string().email("بريد إلكتروني غير صالح").optional().or(z.literal("")),
  phone: z.string().optional(),
  type: z.enum(["PERMANENT", "TEMPORARY"]),
  departmentId: z.string().optional(),
  specialization: z.string().optional(),
  maxHours: z.coerce.number().min(0, "يجب أن يكون ≥ 0").max(40, "لا يمكن تجاوز 40 ساعة").optional(),
});

type FormValues = z.infer<typeof schema>;

interface ProfessorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: { id: string; name: string }[];
  professor?: any; // for edit mode
}

export function ProfessorForm({ open, onOpenChange, departments, professor }: ProfessorFormProps) {
  const isEdit = !!professor;
  const createMutation = useCreateProfessor();
  const updateMutation = useUpdateProfessor();

  // Parse existing name into first/last for edit mode
  const nameParts = professor?.name?.split(" ") || ["", ""];
  const defaultFirstName = nameParts[0] || "";
  const defaultLastName = nameParts.slice(1).join(" ") || "";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      firstName: defaultFirstName,
      lastName: defaultLastName,
      email: professor?.email || "",
      phone: professor?.phone || "",
      type: professor?.type?.toUpperCase() === "TEMPORARY" ? "TEMPORARY" : "PERMANENT",
      departmentId: professor?.departmentId || "",
      maxHours: professor?.maxHours || 18,
    },
  });

  const selectedType = watch("type");

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: professor.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      reset();
      onOpenChange(false);
    } catch (err: any) {
      // error handled via mutation state
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error || updateMutation.error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-3xl p-0 overflow-hidden" dir="rtl">
        {/* Header */}
        <div className="bg-gradient-to-bl from-blue-600 to-indigo-700 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <UserRound className="h-5 w-5" />
              </div>
              {isEdit ? "تعديل بيانات الأستاذ" : "إضافة أستاذ جديد"}
            </DialogTitle>
            <p className="text-blue-100 text-sm mt-1 font-medium">
              {isEdit ? "قم بتحديث المعلومات المطلوبة" : "أدخل معلومات الأستاذ الجديد"}
            </p>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-5">
            {/* Type Toggle */}
            <div className="space-y-2">
              <Label className="font-black text-slate-700">نوع الأستاذ</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "PERMANENT", label: "دائم", icon: Briefcase, desc: "موظف ثابت" },
                  { value: "TEMPORARY", label: "مؤقت", icon: UserRound, desc: "عقد مؤقت" },
                ].map(({ value, label, icon: Icon, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue("type", value as "PERMANENT" | "TEMPORARY")}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-right",
                      selectedType === value
                        ? value === "PERMANENT"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-orange-400 bg-orange-50 text-orange-700"
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-xl",
                      selectedType === value
                        ? value === "PERMANENT" ? "bg-blue-100" : "bg-orange-100"
                        : "bg-white"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-black text-sm">{label}</p>
                      <p className="text-xs opacity-70">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-black text-slate-700">اسم العائلة</Label>
                <Input
                  {...register("lastName")}
                  placeholder="مثال: بن عمر"
                  className={cn("rounded-xl h-11", errors.lastName && "border-red-400 focus-visible:ring-red-300")}
                />
                {errors.lastName && <p className="text-xs text-red-500 font-bold">{errors.lastName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="font-black text-slate-700">الاسم الأول</Label>
                <Input
                  {...register("firstName")}
                  placeholder="مثال: أحمد"
                  className={cn("rounded-xl h-11", errors.firstName && "border-red-400 focus-visible:ring-red-300")}
                />
                {errors.firstName && <p className="text-xs text-red-500 font-bold">{errors.firstName.message}</p>}
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-black text-slate-700">الهاتف (اختياري)</Label>
                <Input
                  {...register("phone")}
                  placeholder="0xxx xxx xxx"
                  dir="ltr"
                  className="rounded-xl h-11 text-left"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-black text-slate-700">البريد الإلكتروني</Label>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="prof@univ.dz"
                  dir="ltr"
                  className={cn("rounded-xl h-11 text-left", errors.email && "border-red-400")}
                />
                {errors.email && <p className="text-xs text-red-500 font-bold">{errors.email.message}</p>}
              </div>
            </div>

            {/* Department & MaxHours */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-black text-slate-700">الحد الأقصى (ساعات/أسبوع)</Label>
                <Input
                  type="number"
                  {...register("maxHours")}
                  min={0}
                  max={40}
                  defaultValue={18}
                  className={cn("rounded-xl h-11", errors.maxHours && "border-red-400")}
                />
                {errors.maxHours && <p className="text-xs text-red-500 font-bold">{errors.maxHours.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="font-black text-slate-700">القسم</Label>
                <Select onValueChange={(v: string | null) => setValue("departmentId", v || "")} defaultValue={professor?.departmentId || ""}>
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="none">بدون قسم</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Mutation Error */}
            {mutationError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-sm text-red-700 font-bold">
                ⚠️ {mutationError.message}
              </div>
            )}
          </div>

          <DialogFooter className="px-6 pb-6 gap-3 flex-row-reverse">
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black shadow-lg shadow-blue-100"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? "حفظ التعديلات" : "إضافة الأستاذ"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 rounded-2xl font-bold"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
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
import { useCreateCourse, useUpdateCourse } from "@/lib/hooks/use-courses";
import { cn } from "@/lib/utils";
import { Loader2, BookOpen } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "اسم المادة مطلوب"),
  code: z.string().min(1, "رمز المادة مطلوب"),
  type: z.enum(["lecture", "td", "tp", "exam"]),
  credits: z.coerce.number().min(1, "الأرصدة يجب أن تكون 1 أو أكثر").optional(),
  hoursPerWeek: z.coerce.number().min(0.5, "عدد الساعات غير صالح").optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface CourseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: any; // for edit mode
}

export function CourseForm({ open, onOpenChange, course }: CourseFormProps) {
  const isEdit = !!course;
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();

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
      name: "",
      code: "",
      type: "lecture",
      credits: 3,
      hoursPerWeek: 1.5,
      description: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (course) {
        reset({
          name: course.name,
          code: course.code,
          type: course.type || "lecture",
          credits: course.credits || 3,
          hoursPerWeek: course.hoursPerWeek || 1.5,
          description: course.description || "",
        });
      } else {
        reset({
          name: "",
          code: "",
          type: "lecture",
          credits: 3,
          hoursPerWeek: 1.5,
          description: "",
        });
      }
    }
  }, [open, course, reset]);

  const selectedType = watch("type");

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: course.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onOpenChange(false);
    } catch (err: any) {
      // error handled in hook
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-3xl p-0 overflow-hidden" dir="rtl">
        <div className="bg-gradient-to-bl from-teal-600 to-emerald-700 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <BookOpen className="h-5 w-5" />
              </div>
              {isEdit ? "تعديل بيانات المادة" : "إضافة مادة جديدة"}
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-black text-slate-700">الاسم</Label>
                <Input
                  {...register("name")}
                  placeholder="مثال: الرياضيات المتقدمة"
                  className={cn("rounded-xl h-11", errors.name && "border-red-400")}
                />
                {errors.name && <p className="text-xs text-red-500 font-bold">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="font-black text-slate-700">الرمز</Label>
                <Input
                  {...register("code")}
                  placeholder="مثال: MATH101"
                  dir="ltr"
                  className={cn("rounded-xl h-11 text-left uppercase", errors.code && "border-red-400")}
                />
                {errors.code && <p className="text-xs text-red-500 font-bold">{errors.code.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-black text-slate-700">النوع الأساسي</Label>
              <Select value={selectedType} onValueChange={(v: string | null) => setValue("type", v as any)}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="lecture">محاضرة</SelectItem>
                  <SelectItem value="td">أعمال موجهة (TD)</SelectItem>
                  <SelectItem value="tp">أعمال تطبيقية (TP)</SelectItem>
                  <SelectItem value="exam">امتحان</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-black text-slate-700">الأرصدة (الكريدي)</Label>
                <Input type="number" {...register("credits")} className="rounded-xl h-11" />
              </div>
              <div className="space-y-2">
                <Label className="font-black text-slate-700">الساعات الأسبوعية</Label>
                <Input type="number" step="0.5" {...register("hoursPerWeek")} className="rounded-xl h-11" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-black text-slate-700">وصف قصير (اختياري)</Label>
              <Input {...register("description")} className="rounded-xl h-11" placeholder="وصف المادة..." />
            </div>
          </div>

          <DialogFooter className="px-6 pb-6 gap-3 flex-row-reverse">
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 h-12 rounded-2xl bg-teal-600 hover:bg-teal-700 font-black shadow-lg shadow-teal-100"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? "حفظ التعديلات" : "إضافة المادة"}
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

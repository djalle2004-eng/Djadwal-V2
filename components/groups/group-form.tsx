"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
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
import { useCreateGroup, useUpdateGroup, useGroupsHierarchy } from "@/lib/hooks/use-groups";
import { cn } from "@/lib/utils";
import { Loader2, Users2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "اسم المجموعة مطلوب"),
  size: z.coerce.number().min(1, "عدد الطلاب غير صالح").max(500),
  departmentId: z.string().optional(),
  specializationId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface GroupFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: any; // for edit mode
  initialDepartmentId?: string;
  initialSpecializationId?: string;
}

export function GroupForm({ open, onOpenChange, group, initialDepartmentId, initialSpecializationId }: GroupFormProps) {
  const isEdit = !!group;
  const createMutation = useCreateGroup();
  const updateMutation = useUpdateGroup();
  const { data: hierarchy } = useGroupsHierarchy();

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
      size: 30,
      departmentId: "",
      specializationId: "",
    },
  });

  const selectedDeptId = watch("departmentId");

  // Get specializations for the selected department
  const specializations = hierarchy?.find((d: any) => d.id === selectedDeptId)?.specializations || [];

  useEffect(() => {
    if (open) {
      if (group) {
        reset({
          name: group.name,
          size: group.size,
          departmentId: group.departmentId || "",
          specializationId: group.specializationId || "",
        });
      } else {
        reset({
          name: "",
          size: 30,
          departmentId: initialDepartmentId || "",
          specializationId: initialSpecializationId || "",
        });
      }
    }
  }, [open, group, initialDepartmentId, initialSpecializationId, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: group.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onOpenChange(false);
    } catch (err: any) {
      // Handled in hook
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-3xl p-0 overflow-hidden" dir="rtl">
        <div className="bg-gradient-to-bl from-rose-600 to-pink-700 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Users2 className="h-5 w-5" />
              </div>
              {isEdit ? "تعديل بيانات المجموعة" : "إضافة مجموعة جديدة"}
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
                  placeholder="مثال: الفوج الأول"
                  className={cn("rounded-xl h-11", errors.name && "border-red-400")}
                />
                {errors.name && <p className="text-xs text-red-500 font-bold">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="font-black text-slate-700">عدد الطلاب</Label>
                <Input
                  type="number"
                  {...register("size")}
                  className={cn("rounded-xl h-11", errors.size && "border-red-400")}
                />
                {errors.size && <p className="text-xs text-red-500 font-bold">{errors.size.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-black text-slate-700">القسم</Label>
              <Select 
                value={selectedDeptId} 
                onValueChange={(v: string | null) => {
                  setValue("departmentId", v || "");
                  setValue("specializationId", ""); // Reset spec when dept changes
                }}
              >
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue placeholder="اختر القسم" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {hierarchy?.map((d: any) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {specializations.length > 0 && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label className="font-black text-slate-700">التخصص (اختياري)</Label>
                <Select 
                  value={watch("specializationId")} 
                  onValueChange={(v: string | null) => setValue("specializationId", v || "")}
                >
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue placeholder="اختر التخصص" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="none">بدون تخصص (مجموعة جذع مشترك)</SelectItem>
                    {specializations.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter className="px-6 pb-6 gap-3 flex-row-reverse">
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 h-12 rounded-2xl bg-rose-600 hover:bg-rose-700 font-black shadow-lg shadow-rose-100"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? "حفظ التعديلات" : "إضافة المجموعة"}
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

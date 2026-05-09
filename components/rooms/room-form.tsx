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
import { useCreateRoom, useUpdateRoom } from "@/lib/hooks/use-rooms";
import { cn } from "@/lib/utils";
import { Loader2, DoorOpen, Monitor, Projector } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "اسم القاعة مطلوب"),
  capacity: z.coerce.number().min(1, "السعة يجب أن تكون أكبر من 0").max(1000, "السعة غير صالحة"),
  type: z.enum(["classroom", "amphitheater", "lab", "computer_lab"]),
  building: z.string().optional(),
  floor: z.coerce.number().optional(),
  hasProjector: z.boolean().default(false),
  hasComputers: z.boolean().default(false),
});

type FormValues = z.infer<typeof schema>;

interface RoomFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room?: any; // for edit mode
}

export function RoomForm({ open, onOpenChange, room }: RoomFormProps) {
  const isEdit = !!room;
  const createMutation = useCreateRoom();
  const updateMutation = useUpdateRoom();

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
      capacity: 30,
      type: "classroom",
      building: "",
      floor: 0,
      hasProjector: false,
      hasComputers: false,
    },
  });

  useEffect(() => {
    if (open) {
      if (room) {
        reset({
          name: room.name,
          capacity: room.capacity,
          type: room.type,
          building: room.building || "",
          floor: room.floor || 0,
          hasProjector: room.hasProjector,
          hasComputers: room.hasComputers,
        });
      } else {
        reset({
          name: "",
          capacity: 30,
          type: "classroom",
          building: "",
          floor: 0,
          hasProjector: false,
          hasComputers: false,
        });
      }
    }
  }, [open, room, reset]);

  const selectedType = watch("type");
  const hasProjector = watch("hasProjector");
  const hasComputers = watch("hasComputers");

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: room.id, data });
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
        <div className="bg-gradient-to-bl from-indigo-600 to-purple-700 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <DoorOpen className="h-5 w-5" />
              </div>
              {isEdit ? "تعديل بيانات القاعة" : "إضافة قاعة جديدة"}
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-black text-slate-700">الاسم / الرمز</Label>
                <Input
                  {...register("name")}
                  placeholder="مثال: القاعة 12"
                  className={cn("rounded-xl h-11", errors.name && "border-red-400")}
                />
                {errors.name && <p className="text-xs text-red-500 font-bold">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="font-black text-slate-700">السعة (عدد الطلاب)</Label>
                <Input
                  type="number"
                  {...register("capacity")}
                  className={cn("rounded-xl h-11", errors.capacity && "border-red-400")}
                />
                {errors.capacity && <p className="text-xs text-red-500 font-bold">{errors.capacity.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-black text-slate-700">النوع</Label>
              <Select value={selectedType} onValueChange={(v: string | null) => setValue("type", v as any)}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="classroom">قاعة تدريس</SelectItem>
                  <SelectItem value="amphitheater">مدرج (Amphi)</SelectItem>
                  <SelectItem value="lab">مخبر</SelectItem>
                  <SelectItem value="computer_lab">مخبر إعلام آلي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-black text-slate-700">المبنى (اختياري)</Label>
                <Input {...register("building")} className="rounded-xl h-11" />
              </div>
              <div className="space-y-2">
                <Label className="font-black text-slate-700">الطابق (اختياري)</Label>
                <Input type="number" {...register("floor")} className="rounded-xl h-11" />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="font-black text-slate-700">المعدات المتوفرة</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setValue("hasProjector", !hasProjector)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-right",
                    hasProjector ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-500"
                  )}
                >
                  <Projector className="h-5 w-5" />
                  <span className="font-bold">جهاز عرض (Data Show)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setValue("hasComputers", !hasComputers)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-right",
                    hasComputers ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-500"
                  )}
                >
                  <Monitor className="h-5 w-5" />
                  <span className="font-bold">أجهزة كمبيوتر</span>
                </button>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 pb-6 gap-3 flex-row-reverse">
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black shadow-lg shadow-indigo-100"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? "حفظ التعديلات" : "إضافة القاعة"}
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

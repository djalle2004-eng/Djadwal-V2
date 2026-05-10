"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_OPTIONS } from "@/lib/rbac";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const userSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  role: z.string().min(1, "الرجاء اختيار دور للمستخدم"),
});

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (newUser: any) => void;
}

export function UserForm({ open, onOpenChange, onSuccess }: UserFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "USER",
    },
  });

  const onSubmit = async (values: z.infer<typeof userSchema>) => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل في إضافة المستخدم");
      }

      toast.success("تم إضافة المستخدم بنجاح");
      onSuccess(data);
      onOpenChange(false);
      form.reset();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-right">إضافة مستخدم جديد</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }: { field: any }) => (
                <FormItem className="space-y-1">
                  <FormLabel>الاسم الكامل</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل اسم المستخدم..." {...field} className="rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }: { field: any }) => (
                <FormItem className="space-y-1">
                  <FormLabel>البريد الإلكتروني</FormLabel>
                  <FormControl>
                    <Input placeholder="example@domain.com" type="email" {...field} className="rounded-xl text-left" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }: { field: any }) => (
                <FormItem className="space-y-1">
                  <FormLabel>كلمة المرور</FormLabel>
                  <FormControl>
                    <Input placeholder="••••••••" type="password" {...field} className="rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }: { field: any }) => (
                <FormItem className="space-y-1">
                  <FormLabel>دور المستخدم</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-xl h-11">
                        <SelectValue placeholder="اختر دوراً..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-2xl">
                      {ROLE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4 flex-row-reverse gap-2">
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl h-11 px-8"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "إنشاء المستخدم"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="rounded-xl h-11"
              >
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

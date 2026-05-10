"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function LogoUploader({ label, value, onChange }: any) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 2 ميغابايت");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/settings/print/upload-logo", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        onChange(data.url);
        toast.success("تم رفع الشعار بنجاح");
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      toast.error("فشل رفع الشعار");
    } finally {
      setIsUploading(false);
      // Reset the file input so the same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative w-16 h-16 rounded border overflow-hidden bg-gray-50 flex-shrink-0">
            <img src={value} alt="Logo" className="object-contain w-full h-full" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded border border-dashed flex items-center justify-center text-xs text-gray-400 bg-gray-50 flex-shrink-0">
            لا شعار
          </div>
        )}
        <div className="flex-1">
          <Input type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleUpload} disabled={isUploading} />
          {isUploading && <p className="text-xs text-blue-500 mt-1">جاري الرفع...</p>}
        </div>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")} className="text-red-500 flex-shrink-0">
            إزالة
          </Button>
        )}
      </div>
    </div>
  );
}

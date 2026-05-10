"use client";

import React, { useState } from "react";
import { useAssignments } from "@/lib/hooks/use-assignments";
import { AssignmentFilters } from "@/components/assignments/AssignmentFilters";
import { AssignmentTable } from "@/components/assignments/AssignmentTable";
import { AssignmentForm } from "@/components/assignments/AssignmentForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function AssignmentsPage() {
  const [filters, setFilters] = useState({});
  const { assignments, isLoading, createAssignment, updateAssignment, deleteAssignment, isCreating, isUpdating } = useAssignments(filters);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any | null>(null);

  const handleOpenCreate = () => {
    setEditingAssignment(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (assignment: any) => {
    setEditingAssignment(assignment);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAssignment(null);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingAssignment) {
        await updateAssignment({ id: editingAssignment.id, data });
        toast.success("تم تحديث التوزيع بنجاح");
      } else {
        await createAssignment(data);
        toast.success("تم إضافة التوزيع بنجاح");
      }
      handleCloseForm();
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ ما");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا التوزيع؟")) {
      try {
        await deleteAssignment(id);
        toast.success("تم الحذف بنجاح");
      } catch (err) {
        toast.error("حدث خطأ أثناء الحذف");
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إدارة التوزيعات (الجدول)</h1>
          <p className="text-gray-500 mt-2">قم بإنشاء وتعديل توزيع الحصص بذكاء مع نظام كشف التعارضات.</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="w-4 h-4" /> إضافة توزيع جديد
        </Button>
      </div>

      {isFormOpen ? (
        <AssignmentForm 
          initialData={editingAssignment} 
          onSubmit={handleSubmit} 
          onCancel={handleCloseForm}
          isSaving={isCreating || isUpdating}
        />
      ) : (
        <>
          <AssignmentFilters filters={filters} onFilterChange={setFilters} />
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">جاري التحميل...</div>
          ) : (
            <AssignmentTable 
              assignments={assignments} 
              onEdit={handleOpenEdit} 
              onDelete={handleDelete} 
            />
          )}
        </>
      )}
    </div>
  );
}

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";

export function AssignmentTable({ assignments, onEdit, onDelete }: any) {
  const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm border" dir="rtl">
      <table className="w-full text-sm text-right">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="p-3">المادة</th>
            <th className="p-3">الأستاذ</th>
            <th className="p-3">المجموعة</th>
            <th className="p-3">القاعة</th>
            <th className="p-3">اليوم والوقت</th>
            <th className="p-3">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {assignments.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center p-6 text-gray-500">لا توجد توزيعات</td>
            </tr>
          ) : (
            assignments.map((assignment: any) => (
              <tr key={assignment.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{assignment.course?.name || "-"}</td>
                <td className="p-3">{assignment.professor?.name || "-"}</td>
                <td className="p-3">{assignment.group?.name || "-"}</td>
                <td className="p-3">{assignment.room?.name || "-"}</td>
                <td className="p-3">
                  {days[assignment.dayOfWeek]} <br/>
                  <span className="text-gray-500 text-xs">{assignment.startTime} - {assignment.endTime}</span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(assignment)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => onDelete(assignment.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

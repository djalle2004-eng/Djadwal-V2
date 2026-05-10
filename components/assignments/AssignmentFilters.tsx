"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AssignmentFilters({ filters, onFilterChange }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white rounded-lg shadow-sm border mb-6" dir="rtl">
      <div>
        <Label>التخصص</Label>
        <Input 
          placeholder="ابحث بالتخصص..." 
          value={filters.specialization || ""} 
          onChange={(e) => onFilterChange({ ...filters, specialization: e.target.value })}
        />
      </div>
      <div>
        <Label>الأستاذ</Label>
        <Input 
          placeholder="ابحث بالأستاذ..." 
          value={filters.professorId || ""} 
          onChange={(e) => onFilterChange({ ...filters, professorId: e.target.value })}
        />
      </div>
      <div>
        <Label>المادة</Label>
        <Input 
          placeholder="ابحث بالمادة..." 
          value={filters.courseId || ""} 
          onChange={(e) => onFilterChange({ ...filters, courseId: e.target.value })}
        />
      </div>
      <div>
        <Label>اليوم</Label>
        <Select 
          value={filters.dayOfWeek?.toString() || "all"} 
          onValueChange={(val) => onFilterChange({ ...filters, dayOfWeek: val === "all" ? undefined : val })}
        >
          <SelectTrigger>
            <SelectValue placeholder="كل الأيام" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأيام</SelectItem>
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
    </div>
  );
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ScheduleFilters } from "@/lib/types/schedule";

async function fetchSchedule(filters: Partial<ScheduleFilters> & { entityId?: string }) {
  const params = new URLSearchParams();
  if (filters.semester) params.set("semester", filters.semester);
  if (filters.academicYear) params.set("academicYear", filters.academicYear);
  if (filters.entityId) {
    if (filters.viewMode === "group")       params.set("groupId", filters.entityId);
    if (filters.viewMode === "professor")   params.set("professorId", filters.entityId);
    if (filters.viewMode === "room")        params.set("roomId", filters.entityId);
    if (filters.viewMode === "department")  params.set("departmentId", filters.entityId);
  }
  const res = await fetch(`/api/schedule?${params}`);
  if (!res.ok) throw new Error("فشل في جلب بيانات الجدول");
  return res.json();
}

async function fetchConflicts(filters: { semester?: string; academicYear?: string }) {
  const params = new URLSearchParams();
  if (filters.semester) params.set("semester", filters.semester);
  if (filters.academicYear) params.set("academicYear", filters.academicYear);
  
  const res = await fetch(`/api/schedule/conflicts?${params.toString()}`);
  if (!res.ok) throw new Error("فشل في فحص الصراعات");
  return res.json();
}

async function createSession(data: any) {
  const res = await fetch("/api/schedule/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "فشل في إضافة الحصة");
  return json;
}

async function moveSession({ id, data }: { id: string; data: any }) {
  const res = await fetch(`/api/schedule/sessions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "فشل في نقل الحصة");
  return json;
}

async function deleteSession(id: string) {
  const res = await fetch(`/api/schedule/sessions/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "فشل في حذف الحصة");
  return json;
}

export function useSchedule(filters: Partial<ScheduleFilters> & { entityId?: string }) {
  return useQuery({
    queryKey: ["schedule", filters],
    queryFn: () => fetchSchedule(filters),
    enabled: !!filters.entityId,
  });
}

export function useConflicts(filters: { semester?: string; academicYear?: string }) {
  return useQuery({
    queryKey: ["schedule", "conflicts", filters.semester, filters.academicYear],
    queryFn: () => fetchConflicts(filters),
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
      toast.success("تمت إضافة الحصة بنجاح");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useMoveSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: moveSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
      toast.success("تم نقل الحصة بنجاح");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
      toast.success("تم حذف الحصة بنجاح");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

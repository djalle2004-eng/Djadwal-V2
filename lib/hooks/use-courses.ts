"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CourseFilters {
  search?: string;
  type?: string;
}

async function fetchCourses(filters: CourseFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.type) params.set("type", filters.type);

  const res = await fetch(`/api/courses?${params}`);
  if (!res.ok) throw new Error("فشل في جلب بيانات المواد");
  return res.json();
}

async function createCourse(data: any) {
  const res = await fetch("/api/courses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "فشل في إضافة المادة");
  return json;
}

async function updateCourse({ id, data }: { id: string; data: any }) {
  const res = await fetch(`/api/courses/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "فشل في تحديث المادة");
  return json;
}

async function deleteCourse(id: string) {
  const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "فشل في حذف المادة");
  return json;
}

export function useCourses(filters: CourseFilters = {}) {
  return useQuery({
    queryKey: ["courses", filters],
    queryFn: () => fetchCourses(filters),
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("تمت إضافة المادة بنجاح");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("تم تحديث بيانات المادة بنجاح");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("تم حذف المادة بنجاح");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

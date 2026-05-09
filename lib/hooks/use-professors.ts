"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ProfessorFilters {
  search?: string;
  department?: string;
  type?: string;
  page?: number;
  limit?: number;
}

async function fetchProfessors(filters: ProfessorFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.department) params.set("department", filters.department);
  if (filters.type) params.set("type", filters.type);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  const res = await fetch(`/api/professors?${params}`);
  if (!res.ok) throw new Error("فشل في جلب بيانات الأساتذة");
  return res.json();
}

async function fetchProfessor(id: string) {
  const res = await fetch(`/api/professors/${id}`);
  if (!res.ok) throw new Error("فشل في جلب بيانات الأستاذ");
  return res.json();
}

async function createProfessor(data: any) {
  const res = await fetch("/api/professors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "فشل في إنشاء الأستاذ");
  return json;
}

async function updateProfessor({ id, data }: { id: string; data: any }) {
  const res = await fetch(`/api/professors/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "فشل في تحديث الأستاذ");
  return json;
}

async function deleteProfessor(id: string) {
  const res = await fetch(`/api/professors/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "فشل في حذف الأستاذ");
  return json;
}

export function useProfessors(filters: ProfessorFilters = {}) {
  return useQuery({
    queryKey: ["professors", filters],
    queryFn: () => fetchProfessors(filters),
    staleTime: 30_000,
  });
}

export function useProfessor(id: string) {
  return useQuery({
    queryKey: ["professor", id],
    queryFn: () => fetchProfessor(id),
    enabled: !!id,
  });
}

export function useCreateProfessor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProfessor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professors"] });
    },
  });
}

export function useUpdateProfessor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfessor,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["professors"] });
      queryClient.invalidateQueries({ queryKey: ["professor", data.id] });
    },
  });
}

export function useDeleteProfessor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProfessor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professors"] });
    },
  });
}

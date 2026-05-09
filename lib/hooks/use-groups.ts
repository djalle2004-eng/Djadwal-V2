"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

async function fetchGroupsHierarchy() {
  const res = await fetch(`/api/groups/hierarchy`);
  if (!res.ok) throw new Error("فشل في جلب بيانات المجموعات");
  return res.json();
}

async function createGroup(data: any) {
  const res = await fetch("/api/groups", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "فشل في إضافة المجموعة");
  return json;
}

async function updateGroup({ id, data }: { id: string; data: any }) {
  const res = await fetch(`/api/groups/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "فشل في تحديث المجموعة");
  return json;
}

async function deleteGroup(id: string) {
  const res = await fetch(`/api/groups/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "فشل في حذف المجموعة");
  return json;
}

export function useGroupsHierarchy() {
  return useQuery({
    queryKey: ["groups", "hierarchy"],
    queryFn: fetchGroupsHierarchy,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("تمت إضافة المجموعة بنجاح");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("تم تحديث بيانات المجموعة بنجاح");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("تم حذف المجموعة بنجاح");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

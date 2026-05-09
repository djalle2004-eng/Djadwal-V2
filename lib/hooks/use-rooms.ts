"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface RoomFilters {
  search?: string;
  type?: string;
}

async function fetchRooms(filters: RoomFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.type) params.set("type", filters.type);

  const res = await fetch(`/api/rooms?${params}`);
  if (!res.ok) throw new Error("فشل في جلب بيانات القاعات");
  return res.json();
}

async function createRoom(data: any) {
  const res = await fetch("/api/rooms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "فشل في إضافة القاعة");
  return json;
}

async function updateRoom({ id, data }: { id: string; data: any }) {
  const res = await fetch(`/api/rooms/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "فشل في تحديث القاعة");
  return json;
}

async function deleteRoom(id: string) {
  const res = await fetch(`/api/rooms/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "فشل في حذف القاعة");
  return json;
}

export function useRooms(filters: RoomFilters = {}) {
  return useQuery({
    queryKey: ["rooms", filters],
    queryFn: () => fetchRooms(filters),
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("تمت إضافة القاعة بنجاح");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("تم تحديث بيانات القاعة بنجاح");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("تم حذف القاعة بنجاح");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

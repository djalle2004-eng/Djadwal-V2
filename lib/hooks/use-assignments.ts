import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface AssignmentParams {
  specialization?: string;
  professorId?: string;
  courseId?: string;
  dayOfWeek?: string;
}

export function useAssignments(params?: AssignmentParams) {
  const queryKey = ["assignments", params];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.specialization) searchParams.set("specialization", params.specialization);
      if (params?.professorId) searchParams.set("professorId", params.professorId);
      if (params?.courseId) searchParams.set("courseId", params.courseId);
      if (params?.dayOfWeek) searchParams.set("dayOfWeek", params.dayOfWeek);

      const res = await fetch(`/api/assignments?${searchParams.toString()}`);
      if (!res.ok) throw new Error("فشل في جلب التوزيعات");
      return res.json();
    },
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "فشل في إضافة التوزيع");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/assignments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("فشل في تحديث التوزيع");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/assignments/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("فشل في حذف التوزيع");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
  });

  return {
    assignments: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    createAssignment: createMutation.mutateAsync,
    updateAssignment: updateMutation.mutateAsync,
    deleteAssignment: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

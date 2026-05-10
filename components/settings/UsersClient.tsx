"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS, ROLE_OPTIONS, type Role } from "@/lib/rbac";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, UserCheck, UserX, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { UserForm } from "./UserForm";

const ROLE_COLORS: Record<string, string> = {
  ADMIN:            "bg-red-100 text-red-700 border-red-200",
  MANAGER:          "bg-orange-100 text-orange-700 border-orange-200",
  SCHEDULE_MANAGER: "bg-blue-100 text-blue-700 border-blue-200",
  PROFESSOR:        "bg-purple-100 text-purple-700 border-purple-200",
  VIEWER:           "bg-slate-100 text-slate-600 border-slate-200",
  USER:             "bg-gray-100 text-gray-600 border-gray-200",
};

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  permission: string;
  isActive: boolean;
  createdAt: Date;
}

export function UsersClient({ users: initialUsers }: { users: User[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoadingId(userId);
    try {
      const res = await fetch(`/api/settings/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error("فشل تحديث الدور");
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success(`تم تغيير دور المستخدم إلى: ${ROLE_LABELS[newRole as Role]}`);
    } catch {
      toast.error("حدث خطأ أثناء تحديث الدور");
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    setLoadingId(userId);
    try {
      const res = await fetch(`/api/settings/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) throw new Error("فشل تحديث الحالة");
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !isActive } : u));
      toast.success(isActive ? "تم تعطيل المستخدم" : "تم تفعيل المستخدم");
    } catch {
      toast.error("حدث خطأ أثناء تحديث الحالة");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white gap-2 h-11 px-6 rounded-2xl font-bold shadow-lg shadow-slate-200"
        >
          <UserPlus className="h-5 w-5" />
          إضافة مستخدم جديد
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Stats bar */}
      <div className="grid grid-cols-3 border-b border-slate-100 divide-x divide-slate-100">
        {[
          { label: "إجمالي المستخدمين", value: users.length, color: "text-slate-900" },
          { label: "نشطون", value: users.filter(u => u.isActive).length, color: "text-emerald-600" },
          { label: "معطلون", value: users.filter(u => !u.isActive).length, color: "text-red-500" },
        ].map((stat, i) => (
          <div key={i} className="p-5 text-center">
            <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-slate-500 text-sm font-medium mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="divide-y divide-slate-50">
        {users.map(user => {
          const isLoading = loadingId === user.id;
          return (
            <div key={user.id} className={`flex items-center gap-4 p-5 hover:bg-slate-50/50 transition-colors ${!user.isActive ? "opacity-60" : ""}`}>
              {/* Avatar */}
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "?"}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-black text-slate-900 truncate">{user.name || "بدون اسم"}</p>
                <p className="text-slate-400 text-xs font-medium truncate">{user.email}</p>
              </div>

              {/* Status */}
              <Badge className={`text-[10px] font-black border flex-shrink-0 ${user.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                {user.isActive ? "نشط" : "معطل"}
              </Badge>

              {/* Role selector */}
              <div className="flex-shrink-0 w-44">
                {isLoading ? (
                  <div className="flex items-center justify-center h-9">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <Select value={user.role} onValueChange={(val: string | null) => val && handleRoleChange(user.id, val)}>
                    <SelectTrigger className="h-9 rounded-xl text-xs border-slate-200 bg-slate-50">
                      <div className="flex items-center gap-2">
                        <Shield className="h-3 w-3 text-slate-400" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {ROLE_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${ROLE_COLORS[opt.value]}`}>
                              {opt.label}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Toggle active */}
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={isLoading}
                onClick={() => handleToggleActive(user.id, user.isActive)}
                className={`rounded-xl flex-shrink-0 ${user.isActive ? "hover:bg-red-50 text-slate-400 hover:text-red-500" : "hover:bg-emerald-50 text-slate-400 hover:text-emerald-600"}`}
                title={user.isActive ? "تعطيل المستخدم" : "تفعيل المستخدم"}
              >
                {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
              </Button>
            </div>
          );
        })}
      </div>

      <UserForm 
        open={isAddModalOpen} 
        onOpenChange={setIsAddModalOpen} 
        onSuccess={(newUser) => setUsers(prev => [newUser, ...prev])}
      />
    </div>
  );
}

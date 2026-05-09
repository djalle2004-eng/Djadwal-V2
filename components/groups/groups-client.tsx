"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Users2,
  Plus,
  Folder,
  FolderOpen,
  ChevronDown,
  ChevronLeft,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  GraduationCap
} from "lucide-react";
import { useGroupsHierarchy, useDeleteGroup } from "@/lib/hooks/use-groups";
import { GroupForm } from "@/components/groups/group-form";
import { cn } from "@/lib/utils";

function GroupItem({ group, onEdit, onDelete }: { group: any, onEdit: any, onDelete: any }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 hover:bg-slate-50 rounded-xl group/item border border-transparent hover:border-slate-100 transition-all mr-6">
      <div className="flex items-center gap-3">
        <Users2 className="h-4 w-4 text-rose-500" />
        <span className="font-bold text-slate-700">{group.name}</span>
        <Badge className="bg-slate-100 text-slate-500 border-none font-bold text-[10px]">
          {group.size} طالب
        </Badge>
      </div>
      <div className="opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" className="h-7 w-7 rounded-lg" onClick={() => onEdit(group)}>
          <Pencil className="h-3 w-3 text-slate-400" />
        </Button>
        <Button variant="ghost" size="icon-sm" className="h-7 w-7 rounded-lg hover:bg-red-50" onClick={() => onDelete(group.id, group.name)}>
          <Trash2 className="h-3 w-3 text-red-500" />
        </Button>
      </div>
    </div>
  );
}

function SpecializationNode({ spec, onEditGroup, onDeleteGroup, onAddGroup }: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mr-6 mb-2">
      <div 
        className="flex items-center gap-2 py-2 px-3 hover:bg-slate-50 rounded-xl cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronLeft className="h-4 w-4 text-slate-400" />}
        {isOpen ? <FolderOpen className="h-4 w-4 text-purple-500" /> : <Folder className="h-4 w-4 text-purple-400" />}
        <span className="font-black text-slate-700">{spec.name}</span>
        <span className="text-xs text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-full">
          {spec.groups?.length || 0} مجموعات
        </span>
      </div>

      {isOpen && (
        <div className="mt-1 pr-4 border-r-2 border-slate-100">
          {spec.groups?.map((g: any) => (
            <GroupItem key={g.id} group={g} onEdit={onEditGroup} onDelete={onDeleteGroup} />
          ))}
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-1 mr-6 text-xs font-bold text-rose-600 hover:bg-rose-50"
            onClick={() => onAddGroup(spec.departmentId, spec.id)}
          >
            <Plus className="h-3 w-3 mr-1" />
            إضافة مجموعة هنا
          </Button>
        </div>
      )}
    </div>
  );
}

function DepartmentNode({ dept, onEditGroup, onDeleteGroup, onAddGroup }: any) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-4 bg-white border border-slate-200 rounded-3xl p-4 shadow-sm">
      <div 
        className="flex items-center justify-between cursor-pointer select-none mb-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-2 rounded-xl">
            <GraduationCap className="h-5 w-5 text-slate-600" />
          </div>
          <h3 className="font-black text-lg text-slate-800">{dept.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl h-8 text-xs font-bold"
            onClick={(e) => { e.stopPropagation(); onAddGroup(dept.id, null); }}
          >
            <Plus className="h-3 w-3 mr-1" />
            مجموعة
          </Button>
          <div className="p-1 rounded-lg hover:bg-slate-100">
            {isOpen ? <ChevronDown className="h-5 w-5 text-slate-400" /> : <ChevronLeft className="h-5 w-5 text-slate-400" />}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          {/* Department Direct Groups */}
          {dept.groups?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-black text-slate-400 mb-2 mr-2">مجموعات القسم (جذع مشترك)</p>
              {dept.groups.map((g: any) => (
                <GroupItem key={g.id} group={g} onEdit={onEditGroup} onDelete={onDeleteGroup} />
              ))}
            </div>
          )}

          {/* Specializations */}
          {dept.specializations?.map((spec: any) => (
            <SpecializationNode 
              key={spec.id} 
              spec={spec} 
              onEditGroup={onEditGroup} 
              onDeleteGroup={onDeleteGroup} 
              onAddGroup={onAddGroup}
            />
          ))}

          {dept.groups?.length === 0 && dept.specializations?.length === 0 && (
            <div className="text-center py-6 text-slate-400">
              <p className="text-sm font-bold">لا توجد مجموعات في هذا القسم</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function GroupsClient() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [initialDept, setInitialDept] = useState<string>("");
  const [initialSpec, setInitialSpec] = useState<string>("");

  const { data: hierarchy, isLoading } = useGroupsHierarchy();
  const deleteMutation = useDeleteGroup();

  const handleAddGroup = (deptId?: string, specId?: string) => {
    setEditingGroup(null);
    setInitialDept(deptId || "");
    setInitialSpec(specId || "");
    setFormOpen(true);
  };

  const handleEditGroup = (group: any) => {
    setEditingGroup(group);
    setFormOpen(true);
  };

  const handleDeleteGroup = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف المجموعة "${name}"؟`)) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="bg-rose-100 p-2 rounded-2xl">
              <Users2 className="h-7 w-7 text-rose-600" />
            </div>
            إدارة المجموعات والأفواج
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            تنظيم هيكلي للأفواج حسب الأقسام والتخصصات
          </p>
        </div>
        <Button
          onClick={() => handleAddGroup()}
          className="bg-rose-600 hover:bg-rose-700 text-white gap-2 px-6 h-12 rounded-2xl shadow-lg shadow-rose-100 font-black"
        >
          <Plus className="h-5 w-5" />
          إضافة مجموعة جديدة
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
          </div>
        ) : hierarchy?.length > 0 ? (
          hierarchy.map((dept: any) => (
            <DepartmentNode 
              key={dept.id} 
              dept={dept} 
              onEditGroup={handleEditGroup}
              onDeleteGroup={handleDeleteGroup}
              onAddGroup={handleAddGroup}
            />
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
            <Users2 className="h-12 w-12 mx-auto text-slate-200 mb-3" />
            <p className="text-slate-500 font-bold">لا توجد أقسام مضافة بعد</p>
          </div>
        )}
      </div>

      <GroupForm
        open={formOpen}
        onOpenChange={setFormOpen}
        group={editingGroup}
        initialDepartmentId={initialDept}
        initialSpecializationId={initialSpec}
      />
    </>
  );
}

"use client";

import { useSession } from "next-auth/react";
import { hasPermission, isAllowedRoute, type Permission, type Role } from "@/lib/rbac";
import { ShieldX } from "lucide-react";

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  requiredPermission?: Permission;
  /** Show a visual "not permitted" block instead of hiding silently */
  showForbidden?: boolean;
  /** Custom fallback element */
  fallback?: React.ReactNode;
}

/**
 * RoleGate — Conditionally renders children based on the current user's role or permission.
 *
 * Usage:
 *   <RoleGate allowedRoles={['ADMIN', 'MANAGER']}>
 *     <DeleteButton />
 *   </RoleGate>
 *
 *   <RoleGate requiredPermission="WRITE">
 *     <EditForm />
 *   </RoleGate>
 */
export function RoleGate({
  children,
  allowedRoles,
  requiredPermission,
  showForbidden = false,
  fallback = null,
}: RoleGateProps) {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role as Role | undefined;

  // Check role-based access
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return showForbidden ? <ForbiddenBlock /> : <>{fallback}</>;
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(role, requiredPermission)) {
    return showForbidden ? <ForbiddenBlock /> : <>{fallback}</>;
  }

  return <>{children}</>;
}

function ForbiddenBlock() {
  return (
    <div className="flex items-center gap-2 text-rose-500 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2 text-sm font-medium w-fit">
      <ShieldX className="h-4 w-4" />
      ليس لديك صلاحية للوصول إلى هذا القسم
    </div>
  );
}

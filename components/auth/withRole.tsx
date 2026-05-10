import { auth } from "@/auth";
import { hasPermission, isAllowedRoute, type Permission, type Role } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { ComponentType } from "react";

interface WithRoleOptions {
  allowedRoles?: Role[];
  requiredPermission?: Permission;
  /** Where to redirect on failure. Defaults to '/dashboard'. */
  redirectTo?: string;
}

/**
 * withRole — A Higher-Order Component (HOC) for protecting Server Component pages.
 *
 * Usage (in a page.tsx):
 *   export default withRole(MyPageComponent, { allowedRoles: ['ADMIN'] });
 *
 * @param Component The page component to protect.
 * @param options   Role/permission requirements.
 */
export function withRole<P extends object>(
  Component: ComponentType<P>,
  options: WithRoleOptions = {}
) {
  const { allowedRoles, requiredPermission, redirectTo = "/dashboard" } = options;

  return async function ProtectedPage(props: P) {
    const session = await auth();
    const role = (session?.user as any)?.role as Role | undefined;

    // Check role access
    if (allowedRoles && (!role || !allowedRoles.includes(role))) {
      redirect(redirectTo);
    }

    // Check permission access
    if (requiredPermission && !hasPermission(role, requiredPermission)) {
      redirect(redirectTo);
    }

    return <Component {...props} />;
  };
}

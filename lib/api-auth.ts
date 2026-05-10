import { auth } from "@/auth";
import { hasPermission, type Permission, type Role } from "@/lib/rbac";
import { NextRequest, NextResponse } from "next/server";

type ApiHandler = (req: NextRequest, context: any) => Promise<NextResponse | Response>;

/**
 * requirePermission — API Route middleware factory.
 * Wraps an API handler and enforces role/permission checks before execution.
 *
 * Usage:
 *   export const POST = requirePermission('WRITE')(async (req) => { ... });
 *   export const DELETE = requirePermission('DELETE')(async (req) => { ... });
 *   export const GET = requirePermission('READ')(async (req) => { ... });
 */
export function requirePermission(permission: Permission) {
  return function (handler: ApiHandler): ApiHandler {
    return async (req: NextRequest, context: any) => {
      const session = await auth();

      if (!session?.user) {
        return NextResponse.json(
          { error: "Unauthorized", message: "يجب تسجيل الدخول أولاً" },
          { status: 401 }
        );
      }

      const role = (session.user as any).role as Role;

      if (!hasPermission(role, permission)) {
        return NextResponse.json(
          {
            error: "Forbidden",
            message: "ليس لديك صلاحية لتنفيذ هذا الإجراء",
            required: permission,
            yourRole: role,
          },
          { status: 403 }
        );
      }

      return handler(req, context);
    };
  };
}

/**
 * Standalone helper for use inside route handlers (without wrapping).
 * Returns { session, role } or throws a NextResponse on auth failure.
 *
 * Usage:
 *   const { session, role } = await checkPermission('WRITE');
 */
export async function checkPermission(permission: Permission) {
  const session = await auth();

  if (!session?.user) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized", message: "يجب تسجيل الدخول أولاً" },
        { status: 401 }
      ),
      session: null,
      role: null,
    };
  }

  const role = (session.user as any).role as Role;

  if (!hasPermission(role, permission)) {
    return {
      error: NextResponse.json(
        {
          error: "Forbidden",
          message: "ليس لديك صلاحية لتنفيذ هذا الإجراء",
          required: permission,
          yourRole: role,
        },
        { status: 403 }
      ),
      session: null,
      role: null,
    };
  }

  return { error: null, session, role };
}

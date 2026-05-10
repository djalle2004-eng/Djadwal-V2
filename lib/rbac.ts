/**
 * lib/rbac.ts
 * Central Role-Based Access Control logic.
 * Roles and Permissions are already defined in Prisma schema.
 */

export type Role = 'ADMIN' | 'MANAGER' | 'SCHEDULE_MANAGER' | 'PROFESSOR' | 'VIEWER' | 'USER';
export type Permission = 'READ' | 'WRITE' | 'DELETE' | 'ADMIN';

/**
 * Defines which permissions each role grants.
 * Higher roles include all permissions of lower roles.
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN:            ['READ', 'WRITE', 'DELETE', 'ADMIN'],
  MANAGER:          ['READ', 'WRITE', 'DELETE'],
  SCHEDULE_MANAGER: ['READ', 'WRITE'],
  PROFESSOR:        ['READ'],
  VIEWER:           ['READ'],
  USER:             ['READ'],
};

/**
 * Route-level role restrictions.
 * Maps URL path prefixes to the roles allowed to access them.
 */
export const ROUTE_ROLE_MAP: Record<string, Role[]> = {
  '/dashboard/settings/users':   ['ADMIN'],
  '/dashboard/settings':         ['ADMIN', 'MANAGER'],
  '/dashboard/assignments':      ['ADMIN', 'MANAGER', 'SCHEDULE_MANAGER'],
  '/dashboard/schedule':         ['ADMIN', 'MANAGER', 'SCHEDULE_MANAGER'],
  '/dashboard/professors':       ['ADMIN', 'MANAGER'],
  '/dashboard/rooms':            ['ADMIN', 'MANAGER'],
  '/dashboard/courses':          ['ADMIN', 'MANAGER'],
  '/dashboard/groups':           ['ADMIN', 'MANAGER'],
  '/dashboard/sessions':         ['ADMIN', 'MANAGER', 'SCHEDULE_MANAGER'],
  '/dashboard/workload':         ['ADMIN', 'MANAGER'],
  '/dashboard':                  ['ADMIN', 'MANAGER', 'SCHEDULE_MANAGER', 'PROFESSOR', 'VIEWER', 'USER'],
};

/**
 * Checks if a given role has the requested permission.
 */
export function hasPermission(role: Role | string | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  const perms = ROLE_PERMISSIONS[role as Role];
  if (!perms) return false;
  return perms.includes(permission);
}

/**
 * Checks if a given role is allowed on a specific route path.
 * Matches on the most specific route prefix found.
 */
export function isAllowedRoute(role: Role | string | undefined | null, pathname: string): boolean {
  if (!role) return false;
  
  // Find the most specific matching route
  const matchingRoute = Object.keys(ROUTE_ROLE_MAP)
    .filter(route => pathname.startsWith(route))
    .sort((a, b) => b.length - a.length)[0]; // Sort by length desc to get most specific

  if (!matchingRoute) return true; // No restriction defined → allow by default
  
  const allowedRoles = ROUTE_ROLE_MAP[matchingRoute];
  return allowedRoles.includes(role as Role);
}

/**
 * Returns a human-readable label for a role.
 */
export const ROLE_LABELS: Record<Role, string> = {
  ADMIN:            'مدير النظام',
  MANAGER:          'مدير',
  SCHEDULE_MANAGER: 'مشرف الجدول',
  PROFESSOR:        'أستاذ',
  VIEWER:           'مشاهد',
  USER:             'مستخدم',
};

/**
 * Returns all roles as an array for select inputs.
 */
export const ROLE_OPTIONS = (Object.keys(ROLE_LABELS) as Role[]).map(r => ({
  value: r,
  label: ROLE_LABELS[r],
}));

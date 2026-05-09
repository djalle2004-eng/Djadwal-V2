import { Role } from "@prisma/client";

export const ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  VIEWER: "VIEWER",
} as const;

export function isAdmin(role?: string) {
  return role === ROLES.ADMIN;
}

export function isManager(role?: string) {
  return role === ROLES.ADMIN || role === ROLES.MANAGER;
}

export function canWrite(role?: string) {
  return role === ROLES.ADMIN || role === ROLES.MANAGER;
}

export function canDeleteUser(role?: string) {
  return role === ROLES.ADMIN;
}

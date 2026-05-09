import { DefaultSession } from "next-auth";
import { Role, Permission } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      permission: Permission;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: Role;
    permission?: Permission;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    permission: Permission;
  }
}

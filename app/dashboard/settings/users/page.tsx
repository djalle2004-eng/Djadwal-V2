import { withRole } from "@/components/auth/withRole";
import db from "@/lib/db";
import { UsersClient } from "@/components/settings/UsersClient";

export const metadata = {
  title: "إدارة المستخدمين | Djadwal",
};

async function UsersPage() {
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      permission: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 max-w-7xl mx-auto" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">إدارة المستخدمين والصلاحيات</h1>
        <p className="text-slate-500 mt-1 font-medium">التحكم في الأدوار والوصول لكل مستخدم في النظام.</p>
      </div>
      <UsersClient users={users} />
    </div>
  );
}

// Protected: Only ADMIN can access
export default withRole(UsersPage, { allowedRoles: ["ADMIN"] });

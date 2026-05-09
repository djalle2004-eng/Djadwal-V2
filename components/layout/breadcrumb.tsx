"use client";

import {
  Breadcrumb as ShadcnBreadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import Link from "next/link";
import React from "react";

export function Breadcrumb() {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean);
  const routeMap: { [key: string]: string } = {
    dashboard: "لوحة التحكم",
    professors: "الأساتذة",
    courses: "المواد",
    rooms: "القاعات",
    groups: "المجموعات",
    schedule: "الجدول",
    assignments: "التوزيع",
    sessions: "الحصص الإضافية",
    workload: "عبء العمل",
    "academic-years": "السنوات الدراسية",
    sandbox: "السيناريوهات",
    settings: "الإعدادات",
  };

  return (
    <ShadcnBreadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href="/dashboard" />}>الرئيسية</BreadcrumbLink>
        </BreadcrumbItem>
        {paths.map((path, index) => {
          const href = `/${paths.slice(0, index + 1).join("/")}`;
          const isLast = index === paths.length - 1;
          const label = routeMap[path] || path;

          if (path === "dashboard" && index === 0) return null;

          return (
            <React.Fragment key={href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="font-bold text-blue-600">{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={href} />}>
                    {label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </ShadcnBreadcrumb>
  );
}

"use client";
import React from "react";
import dynamic from "next/dynamic";
import { SchedulePDF } from "@/components/pdf/SchedulePDF";

// We must dynamically import PDFViewer to avoid SSR issues
const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false, loading: () => <div className="h-[600px] flex items-center justify-center bg-gray-100 rounded-lg text-gray-500">جاري تحميل المعاينة...</div> }
);

export function PrintPreview({ settings }: any) {
  // Mock data for preview
  const mockData = [
    {
      id: "1",
      dayOfWeek: 1, 
      startTime: "08:00",
      endTime: "09:30",
      sessionType: "lecture",
      course: { name: "تحليل رياضي" },
      professor: { name: "د. بن علي" },
      room: { name: "مدرج أ" }
    },
    {
      id: "2",
      dayOfWeek: 2, 
      startTime: "09:30",
      endTime: "11:00",
      sessionType: "td",
      course: { name: "خوارزميات" },
      professor: { name: "أ. منصور" },
      room: { name: "قاعة 12" }
    }
  ];

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden border shadow-sm bg-white">
      <PDFViewer style={{ width: "100%", height: "100%", border: "none" }}>
        <SchedulePDF data={mockData} settings={settings} title="معاينة الجدول" subtitle="نموذج تجريبي للطباعة" />
      </PDFViewer>
    </div>
  );
}

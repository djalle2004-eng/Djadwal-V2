import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { ExamAnnouncementPDF } from '@/components/pdf/ExamAnnouncementPDF';
import db from '@/lib/db';
import React from 'react';

export async function GET(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  
  // Try to find in ExtraSession first (common for specific exams)
  let session = await db.extraSession.findUnique({
    where: { id: sessionId },
    include: {
      course: true,
      professor: true,
      group: true,
      room: true
    }
  }) as any;

  // If not found, try Assignment
  if (!session) {
    session = await db.assignment.findUnique({
      where: { id: sessionId },
      include: {
        course: true,
        professor: true,
        group: true,
        room: true
      }
    });
  }

  if (!session) {
    return NextResponse.json({ message: 'الحصة/الامتحان غير موجود' }, { status: 404 });
  }

  const settings = await db.printSettings.findFirst();

  const buffer = await renderToBuffer(
    <ExamAnnouncementPDF 
      session={session} 
      settings={settings} 
    />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="exam-announcement-${sessionId}.pdf"`
    }
  });
}

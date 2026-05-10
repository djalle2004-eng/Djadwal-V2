import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { SchedulePDF } from '@/components/pdf/SchedulePDF';
import db from '@/lib/db';
import React from 'react';

export async function GET(req: NextRequest, { params }: { params: Promise<{ professorId: string }> }) {
  const { professorId } = await params;
  
  const professor = await db.professor.findUnique({
    where: { id: professorId },
  });

  if (!professor) {
    return NextResponse.json({ message: 'الأستاذ غير موجود' }, { status: 404 });
  }

  const assignments = await db.assignment.findMany({
    where: { professorId },
    include: {
      course: true,
      group: true,
      room: true
    }
  });

  const settings = await db.printSettings.findFirst();

  const buffer = await renderToBuffer(
    <SchedulePDF 
      data={assignments} 
      settings={settings} 
      title={`جدول توقيت الأستاذ`}
      subtitle={`الأستاذ: ${professor.name}`}
    />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="professor-${professorId}.pdf"`
    }
  });
}

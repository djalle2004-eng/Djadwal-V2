import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { SchedulePDF } from '@/components/pdf/SchedulePDF';
import db from '@/lib/db';
import React from 'react';

export async function GET(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  
  const group = await db.group.findUnique({
    where: { id: groupId },
    include: { specialization: true }
  });

  if (!group) {
    return NextResponse.json({ message: 'المجموعة غير موجودة' }, { status: 404 });
  }

  const assignments = await db.assignment.findMany({
    where: { groupId },
    include: {
      course: true,
      professor: true,
      room: true
    }
  });

  const settings = await db.printSettings.findFirst();

  const buffer = await renderToBuffer(
    <SchedulePDF 
      data={assignments} 
      settings={settings} 
      title={`جدول توقيت الأسبوعي`}
      subtitle={`المجموعة: ${group.name} | التخصص: ${group.specialization?.name || 'غير محدد'}`}
    />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="schedule-${group.name}.pdf"`
    }
  });
}

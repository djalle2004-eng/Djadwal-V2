import React from 'react';
import { SchedulePDF } from './SchedulePDF';

export const GroupSchedulePDF = ({ group, assignments, settings }: any) => (
  <SchedulePDF 
    data={assignments} 
    settings={settings} 
    title={`جدول توقيت المجموعة`}
    subtitle={`المجموعة: ${group.name} | التخصص: ${group.specialization?.name || ''}`}
  />
);

import React from 'react';
import { SchedulePDF } from './SchedulePDF';

export const ProfessorSchedulePDF = ({ professor, assignments, settings }: any) => (
  <SchedulePDF 
    data={assignments} 
    settings={settings} 
    title={`جدول توقيت الأستاذ`}
    subtitle={`الأستاذ: ${professor.name}`}
  />
);

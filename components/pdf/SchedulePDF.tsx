import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Register Arabic font - Amiri is a good choice for academic documents
Font.register({
  family: 'Amiri',
  src: 'https://raw.githubusercontent.com/googlefonts/amiri/main/fonts/ttf/Amiri-Regular.ttf'
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Amiri',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1a237e',
    paddingBottom: 10
  },
  logo: {
    width: 60,
    height: 60,
    objectFit: 'contain'
  },
  headerTextContainer: {
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 10
  },
  universityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 2
  },
  facultyName: {
    fontSize: 14,
    color: '#303f9f',
    marginBottom: 5
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    textDecoration: 'underline'
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginTop: 10
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    minHeight: 40
  },
  tableColHeader: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  tableCol: {
    flex: 1,
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    minHeight: 60
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  tableCell: {
    fontSize: 9,
    textAlign: 'center',
    marginBottom: 2
  },
  sessionCard: {
    padding: 4,
    borderRadius: 3,
    marginBottom: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.1)'
  },
  lecture: { backgroundColor: '#e3f2fd', color: '#0d47a1' },
  td: { backgroundColor: '#fff3e0', color: '#e65100' },
  tp: { backgroundColor: '#e8f5e9', color: '#1b5e20' },
  exam: { backgroundColor: '#f3e5f5', color: '#4a148c' },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#757575'
  }
});

const DAYS = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
const TIMES = ['08:00', '09:30', '11:00', '13:00', '14:30', '16:00'];

export const SchedulePDF = ({ data, settings, title, subtitle }: any) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      {/* Header Area */}
      <View style={styles.header}>
        {settings?.universityLogo ? (
          <Image src={settings.universityLogo} style={styles.logo} />
        ) : <View style={styles.logo} />}
        
        <View style={styles.headerTextContainer}>
          <Text style={styles.universityName}>{settings?.universityName || 'الجمهورية الجزائرية الديمقراطية الشعبية'}</Text>
          <Text style={styles.facultyName}>{settings?.facultyName || 'وزارة التعليم العالي والبحث العلمي'}</Text>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={{ fontSize: 12, marginTop: 5 }}>{subtitle}</Text>}
        </View>

        {settings?.facultyLogo ? (
          <Image src={settings.facultyLogo} style={styles.logo} />
        ) : <View style={styles.logo} />}
      </View>

      {/* Schedule Table */}
      <View style={styles.table}>
        {/* Header Row */}
        <View style={styles.tableRow}>
          <View style={[styles.tableColHeader, { flex: 0.6 }]}>
            <Text style={styles.tableCellHeader}>الوقت</Text>
          </View>
          {DAYS.map(day => (
            <View key={day} style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Time Rows */}
        {TIMES.map(time => (
          <View key={time} style={styles.tableRow}>
            <View style={[styles.tableCol, { flex: 0.6, justifyContent: 'center' }]}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{time}</Text>
            </View>
            {DAYS.map((day, idx) => {
              // Note: Adjusting dayOfWeek index if needed. Here assuming Saturday=0 or match DAYS array
              const sessions = data.filter((s: any) => s.dayOfWeek === idx && s.startTime === time);
              
              return (
                <View key={day} style={styles.tableCol}>
                  {sessions.map((s: any) => (
                    <View key={s.id} style={[styles.sessionCard, (styles as any)[s.sessionType?.toLowerCase() || 'lecture']]}>
                      <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{s.course?.name}</Text>
                      <Text style={styles.tableCell}>{s.professor?.name}</Text>
                      <Text style={styles.tableCell}>{s.room?.name || 'قاعة غير محددة'}</Text>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {/* Footer Area */}
      <View style={styles.footer}>
        <Text>{settings?.footerNotes || 'ملاحظة: الجدول قابل للتعديل عند الضرورة'}</Text>
        <Text>تاريخ الاستخراج: {new Date().toLocaleDateString('ar-DZ')}</Text>
      </View>
    </Page>
  </Document>
);

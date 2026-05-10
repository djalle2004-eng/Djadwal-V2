import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

Font.register({
  family: 'Amiri',
  src: 'https://raw.githubusercontent.com/googlefonts/amiri/main/fonts/ttf/Amiri-Regular.ttf'
});

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Amiri',
    backgroundColor: '#ffffff',
  },
  border: {
    border: 3,
    borderColor: '#1a237e',
    padding: 20,
    height: '100%'
  },
  header: {
    textAlign: 'center',
    marginBottom: 40,
  },
  universityName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5
  },
  announcementTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#d32f2f',
    textAlign: 'center',
    marginVertical: 30,
    textDecoration: 'underline'
  },
  content: {
    fontSize: 16,
    lineHeight: 1.8,
    textAlign: 'right',
    marginBottom: 40
  },
  detailRow: {
    flexDirection: 'row-reverse',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    paddingBottom: 5
  },
  label: {
    width: 120,
    fontWeight: 'bold',
    color: '#1a237e'
  },
  value: {
    flex: 1
  },
  warningBox: {
    backgroundColor: '#fff9c4',
    padding: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#fbc02d',
    marginTop: 30
  },
  warningText: {
    fontSize: 14,
    color: '#5d4037',
    textAlign: 'right'
  },
  signatureArea: {
    marginTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});

export const ExamAnnouncementPDF = ({ session, settings }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.border}>
        <View style={styles.header}>
          <Text style={styles.universityName}>{settings?.universityName}</Text>
          <Text style={{ fontSize: 16 }}>{settings?.facultyName}</Text>
        </View>

        <Text style={styles.announcementTitle}>إعلان عن إجراء فرض محروس</Text>

        <View style={styles.content}>
          <View style={styles.detailRow}>
            <Text style={styles.label}>المادة:</Text>
            <Text style={styles.value}>{session?.course?.name} ({session?.course?.code})</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>الأستاذ:</Text>
            <Text style={styles.value}>{session?.professor?.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>المجموعة:</Text>
            <Text style={styles.value}>{session?.group?.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>التاريخ:</Text>
            <Text style={styles.value}>{session?.sessionDate || 'سوف يحدد لاحقاً'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>التوقيت:</Text>
            <Text style={styles.value}>من {session?.startTime} إلى {session?.endTime}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>القاعة:</Text>
            <Text style={styles.value}>{session?.room?.name}</Text>
          </View>
        </View>

        <View style={styles.warningBox}>
          <Text style={[styles.warningText, { fontWeight: 'bold', marginBottom: 5 }]}>ملاحظات هامة:</Text>
          <Text style={styles.warningText}>{settings?.examNotes || 'يمنع الغياب عن الفرض، والغياب غير المبرر يؤدي لعلامة الصفر.'}</Text>
        </View>

        <View style={styles.signatureArea}>
          <Text style={{ fontSize: 12 }}>ختم الإدارة</Text>
          <Text style={{ fontSize: 12 }}>توقيع الأستاذ</Text>
        </View>
      </View>
    </Page>
  </Document>
);

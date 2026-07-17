import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { formatDateTime, getExamStatus } from '../utils/dateFormatter'

export default function ExamListItem({ exam, onPress, showScore = false, score = null }) {
  const status = getExamStatus(exam.start_time, exam.end_time, showScore)

  const statusConfig = {
    selesai: { label: `Selesai — Nilai: ${score}`, bg: '#e8f5e9', color: '#1B5E20' },
    belum_mulai: { label: 'Belum dimulai', bg: '#fff3e0', color: '#f39c12' },
    terlewat: { label: 'Waktu ujian sudah lewat', bg: '#ffebee', color: '#c0392b' },
    aktif: { label: 'Aktif — bisa dikerjakan', bg: '#e3f2fd', color: '#1565c0' },
  }

  const current = statusConfig[status]

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{exam.title}</Text>
      <Text style={styles.subtitle}>{exam.subject}</Text>
      <Text style={styles.info}>Durasi: {exam.duration_minutes} menit</Text>
      <Text style={styles.info}>Mulai: {formatDateTime(exam.start_time)}</Text>

      <View style={[styles.badge, { backgroundColor: current.bg }]}>
        <Text style={[styles.badgeText, { color: current.color }]}>{current.label}</Text>
      </View>

      {status === 'aktif' && onPress && (
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>Kerjakan Sekarang</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: '#eee', borderRadius: 10, padding: 14, marginBottom: 12 },
  title: { fontSize: 16, fontWeight: 'bold' },
  subtitle: { color: '#666', marginTop: 2 },
  info: { color: '#999', fontSize: 12, marginTop: 4 },
  badge: { padding: 8, borderRadius: 6, marginTop: 10 },
  badgeText: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  button: { backgroundColor: '#1B5E20', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: '600' },
})
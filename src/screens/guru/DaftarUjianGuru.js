import { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { getExamsByGuru } from '../../services/examService'
import { useAuth } from '../../context/AuthContext'
import BottomNavGuru from '../../components/BottomNavGuru'

export default function DaftarUjianGuru({ navigation }) {
  const { profile } = useAuth()
  const [exams, setExams] = useState([])
  const [refreshing, setRefreshing] = useState(false)

  async function loadExams() {
    const { data, error } = await getExamsByGuru(profile.id)
    if (!error) setExams(data)
  }

  useFocusEffect(
    useCallback(() => {
      loadExams()
    }, [profile])
  )

  async function onRefresh() {
    setRefreshing(true)
    await loadExams()
    setRefreshing(false)
  }

  return (
    <View style={styles.container}>
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={styles.listContent}
        data={exams}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>Belum ada ujian dibuat.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subject}</Text>
            <Text style={styles.info}>Durasi: {item.duration_minutes} menit</Text>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('TambahSoal', { examId: item.id, examTitle: item.title })}
              >
                <Text style={styles.actionText}>+ Tambah Soal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('ImportSoal', { examId: item.id })}
              >
                <Text style={styles.actionText}>Import CSV</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('HasilUjian', { examId: item.id, examTitle: item.title })}
              >
                <Text style={styles.actionText}>Lihat Hasil</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <BottomNavGuru navigation={navigation} active="Ujian" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  listContent: { padding: 16, paddingBottom: 24 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 },
  card: { borderWidth: 1, borderColor: '#eee', borderRadius: 10, padding: 14, marginBottom: 12 },
  title: { fontSize: 16, fontWeight: 'bold' },
  subtitle: { color: '#666', marginTop: 2 },
  info: { color: '#999', fontSize: 12, marginTop: 4 },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  actionButton: { backgroundColor: '#1B5E20', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  actionText: { color: '#fff', fontSize: 12, fontWeight: '600' },
})
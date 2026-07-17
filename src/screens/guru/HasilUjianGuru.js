import { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native'
import { getResultsByExam } from '../../services/resultService'
import BottomNavGuru from '../../components/BottomNavGuru'

export default function HasilUjianGuru({ route, navigation }) {
  const { examId, examTitle } = route.params || {}
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (examId) {
      loadResults()
    } else {
      setLoading(false)
    }
  }, [examId])

  async function loadResults() {
    setLoading(true)
    const { data, error } = await getResultsByExam(examId)
    if (!error) setResults(data)
    setLoading(false)
  }

  if (loading) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1B5E20" />
        </View>
        <BottomNavGuru navigation={navigation} active="Hasil" />
      </View>
    )
  }

  if (!examId) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Pilih Ujian Dulu</Text>
          <Text style={styles.empty}>
            Buka menu "Daftar Ujian Saya", lalu pilih salah satu ujian untuk melihat hasilnya di sini.
          </Text>
        </View>
        <BottomNavGuru navigation={navigation} active="Hasil" />
      </View>
    )
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.header}>{examTitle}</Text>
        <Text style={styles.subtitle}>{results.length} siswa telah mengerjakan</Text>

        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.empty}>Belum ada siswa yang mengerjakan ujian ini.</Text>}
          renderItem={({ item, index }) => (
            <View style={styles.row}>
              <Text style={styles.rank}>{index + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.profiles?.full_name || 'Tanpa Nama'}</Text>
                <Text style={styles.kelas}>{item.profiles?.kelas}</Text>
              </View>
              <Text style={styles.score}>{item.score}</Text>
            </View>
          )}
        />
      </View>

      <BottomNavGuru navigation={navigation} active="Hasil" />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1B1B1B', marginBottom: 8 },
  header: { fontSize: 18, fontWeight: 'bold' },
  subtitle: { color: '#666', marginBottom: 16 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  rank: { width: 30, fontWeight: 'bold', color: '#666' },
  name: { fontWeight: '600' },
  kelas: { color: '#999', fontSize: 12 },
  score: { fontWeight: 'bold', fontSize: 16, color: '#1B5E20' },
})
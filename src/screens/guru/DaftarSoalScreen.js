import { useState, useCallback } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { getQuestionsByExam, deleteQuestion } from '../../services/questionService'
import { showAlert } from '../../utils/crossAlert'

export default function DaftarSoalScreen({ route, navigation }) {
  const { examId, examTitle } = route.params
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  // id soal yang sedang diproses hapus, supaya cuma tombol itu yang nampilin
  // loading (dan dicegah didobel-tap) -- bukan seluruh layar.
  const [deletingId, setDeletingId] = useState(null)

  async function loadQuestions() {
    const { data, error } = await getQuestionsByExam(examId)
    if (!error) setQuestions(data)
    setLoading(false)
  }

  // useFocusEffect (bukan useEffect biasa) supaya daftar otomatis ter-refresh
  // setiap kali kembali dari EditSoalScreen setelah simpan perubahan.
  useFocusEffect(
    useCallback(() => {
      loadQuestions()
    }, [examId])
  )

  function handleEdit(question) {
    navigation.navigate('EditSoal', { question })
  }

  function handleDelete(question) {
    showAlert(
      'Hapus Soal',
      `Yakin ingin menghapus soal #${question.order_number}? Tindakan ini tidak bisa dibatalkan.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(question.id)
            const { error } = await deleteQuestion(question.id)
            setDeletingId(null)
            if (error) {
              showAlert('Gagal Menghapus', error.message)
            } else {
              setQuestions((prev) => prev.filter((q) => q.id !== question.id))
            }
          },
        },
      ]
    )
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#1B5E20" size="large" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{examTitle}</Text>
      <Text style={styles.subheader}>{questions.length} soal</Text>

      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={styles.listContent}
        data={questions}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>Belum ada soal di ujian ini.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardNumber}>Soal {item.order_number}</Text>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>
                  {item.question_type === 'essay' ? 'Essay' : 'Pilihan Ganda'}
                </Text>
              </View>
            </View>

            <Text style={styles.cardText} numberOfLines={2}>
              {item.question_text}
            </Text>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item)}
                disabled={deletingId === item.id}
              >
                {deletingId === item.id ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.deleteText}>Hapus</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { fontSize: 18, fontWeight: 'bold' },
  subheader: { color: '#666', marginBottom: 12 },
  listContent: { paddingBottom: 24 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 },
  card: { borderWidth: 1, borderColor: '#eee', borderRadius: 10, padding: 14, marginBottom: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  cardNumber: { fontWeight: '700', color: '#1B5E20', fontSize: 13 },
  typeBadge: { backgroundColor: '#E8F5E9', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 12 },
  typeBadgeText: { color: '#1B5E20', fontSize: 11, fontWeight: '600' },
  cardText: { color: '#333', fontSize: 14, marginBottom: 12 },
  actionRow: { flexDirection: 'row', gap: 8 },
  editButton: {
    flex: 1, backgroundColor: '#2B579A', paddingVertical: 10, borderRadius: 8, alignItems: 'center',
  },
  editText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  deleteButton: {
    flex: 1, backgroundColor: '#E53935', paddingVertical: 10, borderRadius: 8, alignItems: 'center',
  },
  deleteText: { color: '#fff', fontWeight: '600', fontSize: 13 },
})
import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, BackHandler } from 'react-native'
import { getQuestionsForStudent, saveStudentAnswer, getMyAnswers } from '../../services/questionService'
import { submitExam } from '../../services/resultService'
import { useAuth } from '../../context/AuthContext'
import Timer from '../../components/Timer'
import BottomNavSiswa from '../../components/BottomNavSiswa'

export default function KerjakanUjianScreen({ route, navigation }) {
  const { examId, examTitle, duration } = route.params
  const { profile } = useAuth()

  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadQuestions()

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert('Keluar dari Ujian?', 'Progress kamu sudah tersimpan otomatis, tapi ujian belum selesai.', [
        { text: 'Batal', style: 'cancel' },
        { text: 'Keluar', onPress: () => navigation.goBack() },
      ])
      return true
    })

    return () => backHandler.remove()
  }, [])

  async function loadQuestions() {
    setLoading(true)
    const { data, error } = await getQuestionsForStudent(examId)
    if (error) {
      Alert.alert('Gagal', 'Tidak bisa memuat soal.')
      navigation.goBack()
      return
    }
    if (!data || data.length === 0) {
      Alert.alert('Soal Belum Tersedia', 'Ujian ini belum memiliki soal. Hubungi guru mata pelajaran terkait.')
      navigation.goBack()
      return
    }
    setQuestions(data)

    const { data: previousAnswers } = await getMyAnswers(examId, profile.id)
    if (previousAnswers) {
      const answersMap = {}
      previousAnswers.forEach((a) => {
        answersMap[a.question_id] = a.selected_option
      })
      setAnswers(answersMap)
    }

    setLoading(false)
  }

  async function handleSelectOption(questionId, option) {
    setAnswers((prev) => ({ ...prev, [questionId]: option }))
    await saveStudentAnswer(examId, questionId, option)
  }

  async function handleSubmit(isAutoSubmit = false) {
    if (!isAutoSubmit) {
      const belumDijawab = questions.length - Object.keys(answers).length
      if (belumDijawab > 0) {
        Alert.alert(
          'Masih Ada Soal Kosong',
          `${belumDijawab} soal belum dijawab. Yakin ingin submit?`,
          [
            { text: 'Batal', style: 'cancel' },
            { text: 'Submit', onPress: () => doSubmit() },
          ]
        )
        return
      }
    }
    doSubmit()
  }

  async function doSubmit() {
    setSubmitting(true)
    const { data, error } = await submitExam(examId, profile.id)
    setSubmitting(false)

    if (error) {
      Alert.alert('Gagal Submit', error.message)
    } else {
      navigation.replace('HasilUjianSiswa', { examId, examTitle, score: data.score })
    }
  }

  function handleTimeUp() {
    Alert.alert('Waktu Habis', 'Ujian akan otomatis dikumpulkan.')
    handleSubmit(true)
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1B5E20" />
      </View>
    )
  }

  const currentQuestion = questions[currentIndex]

  // Guard tambahan: kalau karena sebab apapun currentQuestion tidak ada
  // (mis. race condition saat questions berubah), tampilkan loading
  // daripada crash mengakses properti dari undefined.
  if (!currentQuestion) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1B5E20" />
      </View>
    )
  }

  // Opsi E hanya ditampilkan kalau soal ini memang punya isi di option_e
  const options = ['a', 'b', 'c', 'd', 'e'].filter(
    (opt) => opt !== 'e' || (currentQuestion.option_e && currentQuestion.option_e.trim() !== '')
  )

  return (
    <View style={styles.container}>
      <View style={styles.content}>
      <Timer durationMinutes={duration} onTimeUp={handleTimeUp} />

      <Text style={styles.progress}>
        Soal {currentIndex + 1} dari {questions.length}
      </Text>

      <ScrollView style={styles.questionBox}>
        <Text style={styles.questionText}>{currentQuestion.question_text}</Text>

        {options.map((opt) => {
          const optionText = currentQuestion[`option_${opt}`]
          const isSelected = answers[currentQuestion.id] === opt
          return (
            <TouchableOpacity
              key={opt}
              style={[styles.optionCard, isSelected && styles.optionSelected]}
              onPress={() => handleSelectOption(currentQuestion.id, opt)}
            >
              <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                {opt.toUpperCase()}
              </Text>
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {optionText}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.navDisabled]}
          disabled={currentIndex === 0}
          onPress={() => setCurrentIndex((i) => i - 1)}
        >
          <Text style={styles.navText}>‹ Sebelumnya</Text>
        </TouchableOpacity>

        {currentIndex < questions.length - 1 ? (
          <TouchableOpacity style={styles.navButton} onPress={() => setCurrentIndex((i) => i + 1)}>
            <Text style={styles.navText}>Selanjutnya ›</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.submitButton} onPress={() => handleSubmit(false)} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit Ujian</Text>}
          </TouchableOpacity>
        )}
      </View>
      </View>

      {/* Catatan UX: bottom nav sengaja tetap ditampilkan sesuai permintaan,
          tapi perlu diingat siswa bisa pindah tab di tengah ujian. Jawaban
          yang sudah dipilih tetap tersimpan (autosave lewat saveStudentAnswer),
          jadi progress tidak hilang kalau siswa balik lagi ke sini. */}
      <BottomNavSiswa navigation={navigation} active="Ujian" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  progress: { textAlign: 'center', color: '#666', marginVertical: 12 },
  questionBox: { flex: 1 },
  questionText: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd',
    borderRadius: 8, padding: 12, marginBottom: 10,
  },
  optionSelected: { backgroundColor: '#1B5E20', borderColor: '#1B5E20' },
  optionLabel: { fontWeight: 'bold', width: 24, color: '#333' },
  optionLabelSelected: { color: '#fff' },
  optionText: { flex: 1, color: '#333' },
  optionTextSelected: { color: '#fff' },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  navButton: { backgroundColor: '#eee', padding: 12, borderRadius: 8, flex: 1, marginHorizontal: 4, alignItems: 'center' },
  navDisabled: { opacity: 0.4 },
  navText: { fontWeight: '600', color: '#333' },
  submitButton: { backgroundColor: '#1B5E20', padding: 12, borderRadius: 8, flex: 1, marginHorizontal: 4, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '600' },
})
import { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  BackHandler,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'
import { getQuestionsForStudent, saveStudentAnswer, getMyAnswers } from '../../services/questionService'
import { submitExam } from '../../services/resultService'
import { useAuth } from '../../context/AuthContext'
import BottomNavSiswa from '../../components/BottomNavSiswa'

// -----------------------------------------------------------------------
// Icon assets — taruh jam-icon.png & soal-icon.png di assets/icons
// (sesuaikan path require di bawah ini dengan struktur project Anda).
// -----------------------------------------------------------------------
const ICONS = {
  jam: require('../../../assets/icons/jam-icon.png'),
  soal: require('../../../assets/icons/soal-icon.png'),
}

// ---------- Icon SVG kecil (inline, tidak butuh file gambar) ----------
function IconChevronLeft({ color = '#1A1D29', size = 22 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 5l-7 7 7 7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

function IconShieldCheck({ color = '#1B5E20', size = 16 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path d="M9 12.2l2 2 4-4.4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

function IconClockTiny({ color = '#fff', size = 13 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17Z"
        stroke={color}
        strokeWidth={1.8}
      />
      <Path d="M12 8v4.3l3 1.8" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

// ---------- Helper: format detik -> mm:ss (atau hh:mm:ss kalau > 1 jam) ----------
function formatCountdown(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(safe / 3600)
  const m = Math.floor((safe % 3600) / 60)
  const s = safe % 60
  const pad = (n) => String(n).padStart(2, '0')
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

// ---------- Hook timer ujian (menggantikan komponen <Timer/> lama) ----------
// Dibuat langsung di sini supaya tampilan angka waktu bisa ditata persis
// sesuai desain (di dalam kartu "Sisa Waktu"), tanpa bergantung pada
// styling internal komponen Timer yang lama.
function useExamCountdown(durationMinutes, onTimeUp) {
  const [secondsLeft, setSecondsLeft] = useState(() => Math.round((durationMinutes || 0) * 60))
  const onTimeUpRef = useRef(onTimeUp)
  onTimeUpRef.current = onTimeUp

  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id)
          onTimeUpRef.current && onTimeUpRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return secondsLeft
}

const COLOR_PRIMARY = '#1B5E20'
const COLOR_PRIMARY_LIGHT = '#E1F6E8'
const COLOR_BG = '#FFFFFF'
const COLOR_TEXT = '#1A1D29'
const COLOR_SUBTEXT = '#8B90A0'
const COLOR_BORDER = '#ECEDF2'

const CARD_SHADOW = {
  shadowColor: '#1A1D29',
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 3 },
  elevation: 2,
}

export default function KerjakanUjianScreen({ route, navigation }) {
  const { examId, examTitle, duration } = route.params
  const { profile } = useAuth()

  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [autoSubmitTriggered, setAutoSubmitTriggered] = useState(false)

  useEffect(() => {
    loadQuestions()

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      confirmExit()
      return true
    })

    return () => backHandler.remove()
  }, [])

  function confirmExit() {
    Alert.alert('Keluar dari Ujian?', 'Progress kamu sudah tersimpan otomatis, tapi ujian belum selesai.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', onPress: () => navigation.goBack() },
    ])
  }

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

  const secondsLeft = useExamCountdown(duration, () => {
    if (!autoSubmitTriggered) {
      setAutoSubmitTriggered(true)
      handleTimeUp()
    }
  })

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]} edges={['top']}>
        <ActivityIndicator size="large" color={COLOR_PRIMARY} />
      </SafeAreaView>
    )
  }

  const currentQuestion = questions[currentIndex]

  // Guard tambahan: kalau karena sebab apapun currentQuestion tidak ada
  // (mis. race condition saat questions berubah), tampilkan loading
  // daripada crash mengakses properti dari undefined.
  if (!currentQuestion) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]} edges={['top']}>
        <ActivityIndicator size="large" color={COLOR_PRIMARY} />
      </SafeAreaView>
    )
  }

  // Opsi E hanya ditampilkan kalau soal ini memang punya isi di option_e
  const options = ['a', 'b', 'c', 'd', 'e'].filter(
    (opt) => opt !== 'e' || (currentQuestion.option_e && currentQuestion.option_e.trim() !== '')
  )

  const progressPct = ((currentIndex + 1) / questions.length) * 100

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>

      

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ---------- Info cards: Sisa Waktu & Soal ---------- */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <View style={styles.infoIconWrap}>
              <Image source={ICONS.jam} style={styles.infoIconImg} resizeMode="contain" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Sisa Waktu</Text>
              <Text style={[styles.infoValue, styles.infoValueTime]}>{formatCountdown(secondsLeft)}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIconWrap}>
              <Image source={ICONS.soal} style={styles.infoIconImg} resizeMode="contain" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Soal</Text>
              <Text style={styles.infoValue}>
                {currentIndex + 1} dari {questions.length}
              </Text>
            </View>
          </View>
        </View>

        {/* ---------- Progress bar ---------- */}
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>
          <Text style={styles.progressPercent}>{Math.round(progressPct)}%</Text>
        </View>

        {/* ---------- Kartu Soal ---------- */}
        <View style={styles.questionCard}>
          <View style={styles.soalBadge}>
            <IconClockTiny />
            <Text style={styles.soalBadgeText}>Soal {currentIndex + 1}</Text>
          </View>

          <Text style={styles.questionText}>{currentQuestion.question_text}</Text>

          <View style={styles.optionsWrap}>
            {options.map((opt) => {
              const optionText = currentQuestion[`option_${opt}`]
              const isSelected = answers[currentQuestion.id] === opt
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                  activeOpacity={0.7}
                  onPress={() => handleSelectOption(currentQuestion.id, opt)}
                >
                  <View style={[styles.optionAvatar, isSelected && styles.optionAvatarSelected]}>
                    <Text style={[styles.optionAvatarText, isSelected && styles.optionAvatarTextSelected]}>
                      {opt.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.optionText}>{optionText}</Text>
                  <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      </ScrollView>

      {/* ---------- Tombol navigasi Sebelumnya / Selanjutnya ---------- */}
      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.navButtonPrev, currentIndex === 0 && styles.navDisabled]}
          disabled={currentIndex === 0}
          onPress={() => setCurrentIndex((i) => i - 1)}
        >
          <Text style={styles.navPrevText}>‹ Sebelumnya</Text>
        </TouchableOpacity>

        {currentIndex < questions.length - 1 ? (
          <TouchableOpacity style={styles.navButtonNext} onPress={() => setCurrentIndex((i) => i + 1)}>
            <Text style={styles.navNextText}>Selanjutnya ›</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.navButtonNext} onPress={() => handleSubmit(false)} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.navNextText}>Submit Ujian</Text>}
          </TouchableOpacity>
        )}
      </View>

      {/* Catatan UX: bottom nav sengaja tetap ditampilkan sesuai permintaan,
          tapi perlu diingat siswa bisa pindah tab di tengah ujian. Jawaban
          yang sudah dipilih tetap tersimpan (autosave lewat saveStudentAnswer),
          jadi progress tidak hilang kalau siswa balik lagi ke sini. */}
      <BottomNavSiswa navigation={navigation} active="Ujian" />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLOR_BG },
  center: { justifyContent: 'center', alignItems: 'center' },

  // Header
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLOR_BORDER,
  },
  headerTitle: { fontSize: 19, fontWeight: '700', color: COLOR_TEXT },
  amanBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  amanText: { color: COLOR_PRIMARY, fontWeight: '700', fontSize: 13 },

  scrollContent: { padding: 16, paddingBottom: 24 },

  // Info cards (Sisa Waktu / Soal)
  infoRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  infoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLOR_BORDER,
    ...CARD_SHADOW,
  },
  infoIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLOR_PRIMARY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIconImg: { width: 26, height: 26 },
  infoLabel: { fontSize: 12, color: COLOR_SUBTEXT, marginBottom: 2 },
  infoValue: { fontSize: 17, fontWeight: '700', color: COLOR_TEXT },
  infoValueTime: { color: COLOR_PRIMARY },

  // Progress bar
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  progressTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: '#E9ECF2', overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: COLOR_PRIMARY },
  progressPercent: { fontSize: 13, fontWeight: '600', color: COLOR_TEXT, width: 34, textAlign: 'right' },

  // Kartu soal
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLOR_BORDER,
    ...CARD_SHADOW,
  },
  soalBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLOR_PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 14,
  },
  soalBadgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  questionText: { fontSize: 16, fontWeight: '600', color: COLOR_TEXT, lineHeight: 22, marginBottom: 18 },

  optionsWrap: { gap: 0 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: COLOR_BORDER,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  optionCardSelected: { borderColor: COLOR_PRIMARY, backgroundColor: '#F1FBF3' },
  optionAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLOR_PRIMARY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionAvatarSelected: { backgroundColor: COLOR_PRIMARY },
  optionAvatarText: { fontWeight: '700', fontSize: 14, color: COLOR_PRIMARY },
  optionAvatarTextSelected: { color: '#fff' },
  optionText: { flex: 1, color: COLOR_TEXT, fontSize: 14, lineHeight: 20 },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D7DAE2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: { borderColor: COLOR_PRIMARY },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLOR_PRIMARY },

  // Nav row bawah
  navRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: COLOR_BORDER,
  },
  navButtonPrev: {
    flex: 1,
    backgroundColor: '#F1F2F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  navDisabled: { opacity: 0.4 },
  navPrevText: { color: COLOR_TEXT, fontWeight: '600', fontSize: 14 },
  navButtonNext: {
    flex: 1,
    backgroundColor: COLOR_PRIMARY,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  navNextText: { color: '#fff', fontWeight: '700', fontSize: 14 },
})
import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path, Rect } from 'react-native-svg'
import { useAuth } from '../../context/AuthContext'
import { getResultsByStudent } from '../../services/resultService'
import BottomNavSiswa from '../../components/BottomNavSiswa'

// ---------- Icon set (konsisten dengan DashboardSiswa.js) ----------

function IconBarChart({ color }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x={4} y={13.2} width={3.4} height={6.8} rx={1.2} fill={color} />
      <Rect x={10.3} y={8.4} width={3.4} height={11.6} rx={1.2} fill={color} />
      <Rect x={16.6} y={4} width={3.4} height={16} rx={1.2} fill={color} />
    </Svg>
  )
}

function IconClipboardCheck({ color }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M8 4.5h8a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1Z" stroke={color} strokeWidth={1.7} strokeLinejoin="round"/>
      <Path d="M9.3 4h5.4a.6.6 0 0 1 .6.6v1.2a.6.6 0 0 1-.6.6H9.3a.6.6 0 0 1-.6-.6V4.6a.6.6 0 0 1 .6-.6Z" fill={color}/>
      <Path d="M9 12.5l1.6 1.6L14.7 10" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  )
}

// ---------- Format tanggal manual (konsisten dengan DashboardSiswa.js) ----------

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

function formatTanggal(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`
}

function scoreMeta(score) {
  if (score >= 80) return { color: '#1B5E20', bg: '#E4EFE5', label: 'Sangat Baik' }
  if (score >= 60) return { color: '#C87F1C', bg: '#FCEFDD', label: 'Baik' }
  return { color: '#C0392B', bg: '#FDECEA', label: 'Perlu Belajar Lagi' }
}

/**
 * Screen ini punya 2 mode:
 * 1. MODE HASIL SATU UJIAN — dipakai saat siswa baru selesai mengerjakan ujian.
 *    Dipanggil dengan params: navigation.navigate('HasilUjianSiswa', { examTitle, score })
 * 2. MODE RIWAYAT NILAI — daftar semua nilai siswa. Dipakai saat dibuka tanpa
 *    params, misalnya dari BottomNavSiswa tab "Nilai", menu "Riwayat Ujian",
 *    atau tombol "Lihat Semua" di Dashboard.
 */
export default function HasilUjianSiswa({ route, navigation }) {
  const params = route?.params

  if (params?.examTitle !== undefined) {
    return <HasilSatuUjian examTitle={params.examTitle} score={params.score} navigation={navigation} />
  }

  return <RiwayatNilai navigation={navigation} />
}

// ==================== MODE 1: Hasil satu ujian ====================

function HasilSatuUjian({ examTitle, score, navigation }) {
  function getMessage() {
    if (score >= 80) return { text: 'Luar biasa! 🎉', color: '#1B5E20' }
    if (score >= 60) return { text: 'Bagus, terus semangat! 👍', color: '#f39c12' }
    return { text: 'Terus belajar lagi ya 💪', color: '#c0392b' }
  }

  const message = getMessage()

  return (
    <View style={styles.singleContainer}>
      <Text style={styles.singleTitle}>{examTitle}</Text>
      <Text style={styles.singleLabel}>Ujian Selesai</Text>

      <View style={styles.scoreCircle}>
        <Text style={styles.scoreText}>{score}</Text>
      </View>

      <Text style={[styles.singleMessage, { color: message.color }]}>{message.text}</Text>

      <TouchableOpacity
        style={styles.singleButton}
        onPress={() => navigation.navigate('DaftarUjianSiswa')}
      >
        <Text style={styles.singleButtonText}>Kembali ke Daftar Ujian</Text>
      </TouchableOpacity>
    </View>
  )
}

// ==================== MODE 2: Riwayat nilai (list) ====================

function RiwayatNilai({ navigation }) {
  const { profile } = useAuth()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const loadData = useCallback(async () => {
    if (!profile?.id) return
    setError(null)
    const { data, error } = await getResultsByStudent(profile.id)
    if (error) {
      setError(error.message || 'Gagal memuat nilai')
    } else {
      setResults(data || [])
    }
  }, [profile?.id])

  useEffect(() => {
    setLoading(true)
    loadData().finally(() => setLoading(false))
  }, [loadData])

  async function onRefresh() {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const rataRata =
    results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length)
      : 0

  const nilaiTertinggi =
    results.length > 0 ? Math.max(...results.map((r) => r.score || 0)) : 0

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.loadingCenter]} edges={['top']}>
        <ActivityIndicator size="large" color="#1B5E20" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1B5E20']} />}
      >
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Ringkasan */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIconWrap, { backgroundColor: '#EEE7FB' }]}>
              <IconBarChart color="#6B3FB0" />
            </View>
            <Text style={styles.summaryValue}>{rataRata}</Text>
            <Text style={styles.summaryLabel}>Rata-rata Nilai</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIconWrap, { backgroundColor: '#E4EFE5' }]}>
              <IconClipboardCheck color="#1B5E20" />
            </View>
            <Text style={styles.summaryValue}>{results.length}</Text>
            <Text style={styles.summaryLabel}>Ujian Selesai</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIconWrap, { backgroundColor: '#FCEFDD' }]}>
              <IconBarChart color="#C87F1C" />
            </View>
            <Text style={styles.summaryValue}>{nilaiTertinggi}</Text>
            <Text style={styles.summaryLabel}>Nilai Tertinggi</Text>
          </View>
        </View>

        {/* List nilai */}
        <Text style={styles.sectionTitle}>Riwayat Nilai</Text>

        {results.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Belum ada nilai ujian.</Text>
          </View>
        )}

        {results.map((r) => {
          const subject = r.exams?.subject || r.exams?.title || 'Ujian'
          const meta = scoreMeta(r.score || 0)
          return (
            <View key={r.id} style={styles.nilaiCard}>
              <View style={styles.nilaiCardLeft}>
                <Text style={styles.nilaiSubject} numberOfLines={1}>{subject}</Text>
                <Text style={styles.nilaiDate}>{formatTanggal(r.submitted_at)}</Text>
                <View style={[styles.nilaiBadge, { backgroundColor: meta.bg }]}>
                  <Text style={[styles.nilaiBadgeText, { color: meta.color }]}>{meta.label}</Text>
                </View>
              </View>
              <View style={[styles.nilaiScoreWrap, { backgroundColor: meta.bg }]}>
                <Text style={[styles.nilaiScoreText, { color: meta.color }]}>{r.score}</Text>
              </View>
            </View>
          )
        })}
      </ScrollView>

      <BottomNavSiswa navigation={navigation} active="Nilai" />
    </SafeAreaView>
  )
}

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 3 },
  elevation: 2,
}

const styles = StyleSheet.create({
  // ---------- Mode 1: hasil satu ujian ----------
  singleContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  singleTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  singleLabel: { color: '#666', marginBottom: 24 },
  scoreCircle: {
    width: 140, height: 140, borderRadius: 70, backgroundColor: '#1B5E20',
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  scoreText: { color: '#fff', fontSize: 42, fontWeight: 'bold' },
  singleMessage: { fontSize: 16, fontWeight: '600', marginBottom: 32 },
  singleButton: { backgroundColor: '#1B5E20', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 8 },
  singleButtonText: { color: '#fff', fontWeight: '600' },

  // ---------- Mode 2: riwayat nilai (list) ----------
  safeArea: { flex: 1, backgroundColor: '#F5F7F5' },
  loadingCenter: { alignItems: 'center', justifyContent: 'center' },

  scrollContent: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 32 },

  errorBanner: { backgroundColor: '#FDECEA', borderRadius: 12, padding: 12, marginBottom: 14 },
  errorText: { color: '#c0392b', fontSize: 12.5 },

  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 22 },
  summaryCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 6, alignItems: 'center', ...CARD_SHADOW },
  summaryIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  summaryValue: { fontSize: 19, fontWeight: '700', color: '#1A1D1B' },
  summaryLabel: { fontSize: 10.5, color: '#8A8F8B', textAlign: 'center', marginTop: 3 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1D1B', marginBottom: 12 },

  emptyWrap: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', ...CARD_SHADOW },
  emptyText: { color: '#A0A5A1', fontSize: 12.5, fontStyle: 'italic' },

  nilaiCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, ...CARD_SHADOW,
  },
  nilaiCardLeft: { flex: 1, paddingRight: 12 },
  nilaiSubject: { fontSize: 14.5, fontWeight: '700', color: '#1A1D1B' },
  nilaiDate: { fontSize: 11.5, color: '#8A8F8B', marginTop: 2, marginBottom: 8 },
  nilaiBadge: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  nilaiBadgeText: { fontSize: 10.5, fontWeight: '700' },
  nilaiScoreWrap: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  nilaiScoreText: { fontSize: 17, fontWeight: '700' },
})
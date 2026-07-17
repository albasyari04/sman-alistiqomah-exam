import { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path, Rect } from 'react-native-svg'
import { useAuth } from '../../context/AuthContext'
import { getAllActiveExams } from '../../services/examService'
import { getResultsByStudent } from '../../services/resultService'
import BottomNavSiswa from '../../components/BottomNavSiswa'

// ---------- Icon set (gaya konsisten dengan DashboardSiswa.js) ----------

function IconClock({ color }) {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
      <Path d="M12 7v5.3l3.6 2.1" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17Z" stroke={color} strokeWidth={1.8} />
    </Svg>
  )
}

function IconCalendarEmpty({ color }) {
  return (
    <Svg width={46} height={46} viewBox="0 0 24 24" fill="none">
      <Rect x={4} y={5.5} width={16} height={14.5} rx={2} stroke={color} strokeWidth={1.5} />
      <Path d="M4 9.5h16M8 3.5v3M16 3.5v3" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  )
}

function IconPlay({ color }) {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
      <Path d="M6 4.5v15l13-7.5-13-7.5Z" fill={color} />
    </Svg>
  )
}

// ---------- Helper tanggal (manual, konsisten dengan DashboardSiswa.js) ----------

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu']
const HARI_PENDEK = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

function dateKey(isoString) {
  const d = new Date(isoString)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function formatJam(startIso, endIso) {
  if (!startIso) return '-'
  const pad = (n) => String(n).padStart(2, '0')
  const s = new Date(startIso)
  const startStr = `${pad(s.getHours())}.${pad(s.getMinutes())}`
  if (!endIso) return `${startStr} WIB`
  const e = new Date(endIso)
  const endStr = `${pad(e.getHours())}.${pad(e.getMinutes())}`
  return `${startStr} - ${endStr} WIB`
}

function isToday(d) {
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
}

function isTomorrow(d) {
  const t = new Date()
  t.setDate(t.getDate() + 1)
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate()
}

function dateGroupLabel(isoString) {
  const d = new Date(isoString)
  if (isToday(d)) return 'Hari Ini'
  if (isTomorrow(d)) return 'Besok'
  return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`
}

function examStatus(exam, completedExamIds) {
  const now = Date.now()
  const start = new Date(exam.start_time).getTime()
  const end = exam.end_time ? new Date(exam.end_time).getTime() : null

  if (completedExamIds.has(exam.id)) {
    return { label: 'Selesai', bg: '#EFF1EF', color: '#6B716D' }
  }
  if (end && now > end) {
    return { label: 'Terlewat', bg: '#FDECEA', color: '#c0392b' }
  }
  if (now >= start && (!end || now <= end)) {
    return { label: 'Berlangsung', bg: '#E4EFE5', color: '#1B5E20' }
  }
  return { label: 'Akan Datang', bg: '#E3F0FB', color: '#1F6FB2' }
}

export default function JadwalUjianSiswa({ navigation }) {
  const { profile } = useAuth()
  const [exams, setExams] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const loadData = useCallback(async () => {
    if (!profile?.id) return
    setError(null)
    const [examsRes, resultsRes] = await Promise.all([
      getAllActiveExams(),
      getResultsByStudent(profile.id),
    ])
    if (examsRes.error || resultsRes.error) {
      setError(examsRes.error?.message || resultsRes.error?.message || 'Gagal memuat jadwal')
    } else {
      setExams(examsRes.data || [])
      setResults(resultsRes.data || [])
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

  const completedExamIds = new Set(results.map((r) => r.exam_id))

  // Urutkan kronologis, lalu kelompokkan per tanggal
  const sortedExams = [...exams].sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
  const groups = []
  sortedExams.forEach((exam) => {
    const key = dateKey(exam.start_time)
    let group = groups.find((g) => g.key === key)
    if (!group) {
      const d = new Date(exam.start_time)
      group = {
        key,
        label: dateGroupLabel(exam.start_time),
        dayNum: d.getDate(),
        dayShort: HARI_PENDEK[d.getDay()],
        isToday: isToday(d),
        items: [],
      }
      groups.push(group)
    }
    group.items.push(exam)
  })

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

        {groups.length === 0 && !error && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <IconCalendarEmpty color="#B7BCB8" />
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Jadwal Ujian</Text>
            <Text style={styles.emptyDesc}>Jadwal ujian yang tersedia untuk kelasmu akan muncul di sini.</Text>
          </View>
        )}

        {groups.map((group, gIdx) => (
          <View key={group.key} style={styles.groupBlock}>
            <View style={styles.groupHeaderRow}>
              <View style={[styles.dateBadge, group.isToday && styles.dateBadgeToday]}>
                <Text style={[styles.dateBadgeNum, group.isToday && styles.dateBadgeNumToday]}>{group.dayNum}</Text>
                <Text style={[styles.dateBadgeDay, group.isToday && styles.dateBadgeDayToday]}>{group.dayShort}</Text>
              </View>
              <Text style={styles.groupLabel}>{group.label}</Text>
            </View>

            <View style={styles.timelineWrap}>
              {gIdx < groups.length && <View style={styles.timelineLine} />}

              {group.items.map((exam) => {
                const status = examStatus(exam, completedExamIds)
                const canStart = status.label === 'Berlangsung'
                return (
                  <View key={exam.id} style={styles.timelineItem}>
                    <View style={styles.timelineDotWrap}>
                      <View style={[styles.timelineDot, { backgroundColor: status.color }]} />
                    </View>

                    <View style={styles.examCard}>
                      <View style={styles.examCardTop}>
                        <Text style={styles.examSubject} numberOfLines={1}>{exam.subject || exam.title}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                          <Text style={[styles.statusBadgeText, { color: status.color }]}>{status.label}</Text>
                        </View>
                      </View>

                      {exam.title && exam.subject && (
                        <Text style={styles.examTitle} numberOfLines={1}>{exam.title}</Text>
                      )}

                      <View style={styles.examMetaRow}>
                        <IconClock color="#8A8F8B" />
                        <Text style={styles.examMetaText}>{formatJam(exam.start_time, exam.end_time)}</Text>
                      </View>

                      {canStart && (
                        <TouchableOpacity
                          style={styles.startButton}
                          activeOpacity={0.85}
                          onPress={() => navigation.navigate('KerjakanUjian', { examId: exam.id })}
                        >
                          <IconPlay color="#fff" />
                          <Text style={styles.startButtonText}>Mulai Ujian</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      <BottomNavSiswa navigation={navigation} active="Jadwal" />
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
  safeArea: { flex: 1, backgroundColor: '#F5F7F5' },
  loadingCenter: { alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 110 },

  errorBanner: { backgroundColor: '#FDECEA', borderRadius: 12, padding: 12, marginBottom: 14 },
  errorText: { color: '#c0392b', fontSize: 12.5 },

  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 30 },
  emptyIconWrap: {
    width: 84, height: 84, borderRadius: 42, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16, ...CARD_SHADOW,
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#1A1D1B', marginBottom: 6 },
  emptyDesc: { fontSize: 12.5, color: '#8A8F8B', textAlign: 'center', lineHeight: 18 },

  groupBlock: { marginBottom: 6 },
  groupHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  dateBadge: {
    width: 42, height: 42, borderRadius: 12, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', ...CARD_SHADOW,
  },
  dateBadgeToday: { backgroundColor: '#1B5E20' },
  dateBadgeNum: { fontSize: 15, fontWeight: '700', color: '#1A1D1B', lineHeight: 17 },
  dateBadgeNumToday: { color: '#fff' },
  dateBadgeDay: { fontSize: 9, color: '#8A8F8B', fontWeight: '600', marginTop: 1 },
  dateBadgeDayToday: { color: '#D7ECD9' },
  groupLabel: { fontSize: 14.5, fontWeight: '700', color: '#1A1D1B' },

  timelineWrap: { position: 'relative', paddingLeft: 21, marginBottom: 8 },
  timelineLine: {
    position: 'absolute', left: 20, top: 4, bottom: 4, width: 1.5, backgroundColor: '#DDE2DE',
  },
  timelineItem: { flexDirection: 'row', marginBottom: 14 },
  timelineDotWrap: { width: 24, alignItems: 'center', paddingTop: 16 },
  timelineDot: { width: 9, height: 9, borderRadius: 5, borderWidth: 2, borderColor: '#fff' },

  examCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, marginLeft: 6, ...CARD_SHADOW },
  examCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 3 },
  examSubject: { flex: 1, fontSize: 14.5, fontWeight: '700', color: '#1A1D1B' },
  examTitle: { fontSize: 11.5, color: '#8A8F8B', marginBottom: 6 },
  statusBadge: { paddingHorizontal: 9, paddingVertical: 3.5, borderRadius: 20 },
  statusBadgeText: { fontSize: 10, fontWeight: '700' },
  examMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  examMetaText: { fontSize: 12, color: '#8A8F8B' },

  startButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#1B5E20', paddingVertical: 9, borderRadius: 10, marginTop: 12,
  },
  startButtonText: { color: '#fff', fontWeight: '700', fontSize: 12.5 },
})
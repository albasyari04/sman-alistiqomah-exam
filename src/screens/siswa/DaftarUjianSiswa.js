import { useCallback, useState } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Image } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { getAllActiveExams } from '../../services/examService'
import { getMyResult } from '../../services/resultService'
import { useAuth } from '../../context/AuthContext'
import BottomNavSiswa from '../../components/BottomNavSiswa'

const ICON_UJIAN = require('../../../assets/icons/ujian-icon.png')

const COLORS = {
  primary: '#1B5E20',
  primaryLight: '#2E7D32',
  bg: '#F4F6F5',
  card: '#FFFFFF',
  border: '#ECEFEE',
  textDark: '#1C1C1C',
  textMuted: '#8A8F8C',
  success: '#2E7D32',
  successBg: '#E8F5E9',
  warning: '#B8860B',
  warningBg: '#FFF6E5',
  danger: '#C62828',
  dangerBg: '#FDECEC',
}

const STATUS_CONFIG = {
  aktif: {
    label: 'Sedang Berlangsung',
    icon: 'flash',
    color: COLORS.primary,
    bg: COLORS.successBg,
  },
  selesai: {
    label: 'Selesai',
    icon: 'checkmark-circle',
    color: COLORS.success,
    bg: COLORS.successBg,
  },
  belum_mulai: {
    label: 'Belum Dimulai',
    icon: 'time',
    color: COLORS.warning,
    bg: COLORS.warningBg,
  },
  terlewat: {
    label: 'Waktu Habis',
    icon: 'close-circle',
    color: COLORS.danger,
    bg: COLORS.dangerBg,
  },
}

export default function DaftarUjianSiswa({ navigation }) {
  const { profile } = useAuth()
  const [exams, setExams] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)

  async function loadExams() {
    const { data, error } = await getAllActiveExams()
    if (error) {
      setLoading(false)
      return
    }

    const examsWithStatus = await Promise.all(
      data.map(async (exam) => {
        const { data: result } = await getMyResult(exam.id, profile.id)
        return { ...exam, alreadySubmitted: !!result, score: result?.score }
      })
    )
    setExams(examsWithStatus)
    setLoading(false)
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

  function getExamStatus(exam) {
    const now = new Date()
    const start = new Date(exam.start_time)
    const end = new Date(exam.end_time)

    if (exam.alreadySubmitted) return 'selesai'
    if (now < start) return 'belum_mulai'
    if (now > end) return 'terlewat'
    return 'aktif'
  }

  function renderActionButton(status, item) {
    if (status === 'aktif') {
      return (
        <TouchableOpacity
          style={styles.btnPrimary}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate('KerjakanUjian', {
              examId: item.id,
              examTitle: item.title,
              duration: item.duration_minutes,
            })
          }
        >
          <Ionicons name="create-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.btnPrimaryText}>Kerjakan Sekarang</Text>
        </TouchableOpacity>
      )
    }

    if (status === 'selesai') {
      return (
        <TouchableOpacity
          style={styles.btnOutline}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate('HasilUjianSiswa', {
              examId: item.id,
              examTitle: item.title,
              score: item.score,
            })
          }
        >
          <Ionicons name="document-text-outline" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
          <Text style={styles.btnOutlineText}>Lihat Hasil</Text>
        </TouchableOpacity>
      )
    }

    if (status === 'belum_mulai') {
      return (
        <View style={styles.btnDisabled}>
          <Ionicons name="lock-closed-outline" size={16} color={COLORS.textMuted} style={{ marginRight: 6 }} />
          <Text style={styles.btnDisabledText}>Belum Bisa Dikerjakan</Text>
        </View>
      )
    }

    // terlewat
    return (
      <View style={styles.btnDisabled}>
        <Ionicons name="ban-outline" size={16} color={COLORS.textMuted} style={{ marginRight: 6 }} />
        <Text style={styles.btnDisabledText}>Waktu Ujian Telah Berakhir</Text>
      </View>
    )
  }

  const total = exams.length
  const selesaiCount = exams.filter((e) => getExamStatus(e) === 'selesai').length
  const aktifCount = exams.filter((e) => getExamStatus(e) === 'aktif').length

  return (
    <View style={styles.container}>
      <FlatList
        data={exams}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerTopRow}>
              <View style={styles.headerIconWrap}>
                <Image source={ICON_UJIAN} style={styles.headerIconImg} resizeMode="contain" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerCaption}>Kelola dan kerjakan ujianmu di sini</Text>
              </View>
            </View>

            {total > 0 && (
              <View style={styles.headerStatsRow}>
                <View style={styles.headerStatPill}>
                  <View style={[styles.headerStatDot, { backgroundColor: COLORS.primary }]} />
                  <Text style={styles.headerStatPillText}>{aktifCount} Berlangsung</Text>
                </View>
                <View style={styles.headerStatPill}>
                  <View style={[styles.headerStatDot, { backgroundColor: COLORS.success }]} />
                  <Text style={styles.headerStatPillText}>{selesaiCount} Selesai</Text>
                </View>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color="#C9CDCB" />
              <Text style={styles.emptyTitle}>Belum Ada Ujian</Text>
              <Text style={styles.emptyText}>Ujian yang tersedia akan muncul di sini.</Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const status = getExamStatus(item)
          const config = STATUS_CONFIG[status]

          return (
            <View style={[styles.card, { borderLeftColor: config.color }]}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.subtitle}>{item.subject}</Text>
                </View>

                <View style={[styles.chip, { backgroundColor: config.bg }]}>
                  <Ionicons name={config.icon} size={12} color={config.color} />
                  <Text style={[styles.chipText, { color: config.color }]}>{config.label}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                  <Text style={styles.metaText}>{item.duration_minutes} menit</Text>
                </View>

                {status === 'selesai' && (
                  <View style={styles.metaItem}>
                    <Ionicons name="ribbon-outline" size={14} color={COLORS.textMuted} />
                    <Text style={styles.metaText}>Nilai: {item.score}</Text>
                  </View>
                )}
              </View>

              <View style={styles.divider} />

              {renderActionButton(status, item)}
            </View>
          )
        }}
      />

      <BottomNavSiswa navigation={navigation} active="DaftarUjian" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    marginBottom: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.successBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerIconImg: {
    width: 24,
    height: 24,
  },
  headerCount: { fontSize: 17, fontWeight: '700', color: COLORS.textDark },
  headerCaption: { fontSize: 13.5, fontWeight: '600', color: COLORS.textDark },
  headerStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  headerStatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  headerStatDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  headerStatPillText: { fontSize: 11.5, fontWeight: '600', color: COLORS.textDark },

  listContent: { paddingBottom: 100, flexGrow: 1 },

  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 80, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textDark, marginTop: 12 },
  emptyText: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  title: { fontSize: 15.5, fontWeight: '700', color: COLORS.textDark, lineHeight: 20 },
  subtitle: { fontSize: 12.5, color: COLORS.textMuted, marginTop: 3 },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  chipText: { fontSize: 10.5, fontWeight: '700', marginLeft: 4 },

  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 12, color: COLORS.textMuted, marginLeft: 5 },

  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 14 },

  btnPrimary: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  btnOutline: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutlineText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },

  btnDisabled: {
    flexDirection: 'row',
    backgroundColor: '#F1F2F1',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabledText: { color: COLORS.textMuted, fontWeight: '600', fontSize: 13 },
})
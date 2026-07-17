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
import Svg, { Path, Circle } from 'react-native-svg'
import { useAuth } from '../../context/AuthContext'
import { getPengumumanForStudent } from '../../services/pengumumanService'

const COLOR_PRIMARY = '#2F6FED'
const COLOR_TEXT = '#1C2033'
const COLOR_SUBTEXT = '#8A8F9C'

// ---------- Icon ----------
function IconBack({ color = COLOR_TEXT }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M15 5l-7 7 7 7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

function IconMegaphone({ color }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M4 10.5v3a1 1 0 0 0 1 1h1.5l7 3.3V6.7l-7 3.3H5a1 1 0 0 0-1 1Z" stroke={color} strokeWidth={1.7} strokeLinejoin="round" />
      <Path d="M17 9c1.2 1 1.2 4 0 5" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
      <Path d="M8 14.5v3a1.5 1.5 0 0 0 3 0v-1.7" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  )
}

function IconCalendarSmall({ color }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M4 5.5h16v14.5H4z" stroke={color} strokeWidth={1.7} strokeLinejoin="round" />
      <Path d="M4 9.5h16" stroke={color} strokeWidth={1.7} />
    </Svg>
  )
}

function IconCheckCircleSmall({ color }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={8} stroke={color} strokeWidth={1.7} />
      <Path d="M8.5 12.3l2.3 2.3 4.7-4.9" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

function IconInboxEmpty({ color = '#C3C7D1' }) {
  return (
    <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
      <Path d="M4 12.5V6.5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v6" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      <Path d="M4 12.5h4.5l1.3 2.2h4.4l1.3-2.2H20" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      <Path d="M4 12.5V18a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5.5" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    </Svg>
  )
}

const CATEGORY_META = {
  umum: { icon: IconMegaphone, bg: '#EEE7FB', color: '#6B3FB0' },
  akademik: { icon: IconCalendarSmall, bg: '#E4ECFC', color: '#2F6FED' },
  ujian: { icon: IconCheckCircleSmall, bg: '#FDF1DE', color: '#E0982A' },
  libur: { icon: IconMegaphone, bg: '#E1F6E8', color: '#1FAE5C' },
}

const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

function formatWaktu(isoString) {
  if (!isoString) return '-'
  const d = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffJam = Math.floor(diffMin / 60)
  const diffHari = Math.floor(diffJam / 24)

  if (diffMin < 1) return 'Baru saja'
  if (diffMin < 60) return `${diffMin} menit lalu`
  if (diffJam < 24) return `${diffJam} jam lalu`
  if (diffHari < 7) return `${diffHari} hari lalu`
  return `${d.getDate()} ${BULAN_PENDEK[d.getMonth()]} ${d.getFullYear()}`
}

export default function NotifikasiSiswa({ navigation }) {
  const { profile } = useAuth()
  const [notifikasi, setNotifikasi] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  // Menyimpan id notifikasi yang sudah dibuka/dibaca di sesi ini.
  const [readIds, setReadIds] = useState(new Set())

  const loadData = useCallback(async () => {
    setError(null)
    const res = await getPengumumanForStudent()
    if (res.error) {
      setError(res.error?.message || 'Gagal memuat notifikasi')
    } else {
      setNotifikasi(res.data || [])
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

  function handlePressNotif(item) {
    setReadIds((prev) => new Set(prev).add(item.id))
    // TODO: arahkan ke detail notifikasi/pengumuman spesifik bila ada
    // screen detail-nya, contoh:
    // navigation.navigate('DetailPengumuman', { id: item.id })
  }

  const belumDibaca = notifikasi.filter((n) => !readIds.has(n.id)).length

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.headerSection}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <IconBack />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Notifikasi</Text>
          {belumDibaca > 0 && (
            <Text style={styles.headerSubtitle}>{belumDibaca} belum dibaca</Text>
          )}
        </View>
        <View style={{ width: 38 }} />
      </View>

      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={COLOR_PRIMARY} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLOR_PRIMARY]} />}
        >
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {!error && notifikasi.length === 0 && (
            <View style={styles.emptyWrap}>
              <IconInboxEmpty />
              <Text style={styles.emptyTitle}>Belum Ada Notifikasi</Text>
              <Text style={styles.emptyText}>Notifikasi terbaru akan muncul di sini.</Text>
            </View>
          )}

          {notifikasi.map((item) => {
            const meta = CATEGORY_META[item.category] || CATEGORY_META.umum
            const isRead = readIds.has(item.id)
            const Icon = meta.icon
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.notifCard, !isRead && styles.notifCardUnread]}
                activeOpacity={0.7}
                onPress={() => handlePressNotif(item)}
              >
                <View style={[styles.notifIconWrap, { backgroundColor: meta.bg }]}>
                  <Icon color={meta.color} />
                </View>
                <View style={styles.notifTextWrap}>
                  <View style={styles.notifTopRow}>
                    <Text style={styles.notifCategory}>{item.category || 'Umum'}</Text>
                    {!isRead && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notifTitle} numberOfLines={1}>
                    {item.title || item.judul}
                  </Text>
                  <Text style={styles.notifBody} numberOfLines={2}>
                    {item.body || item.isi || item.konten}
                  </Text>
                  <Text style={styles.notifDate}>{formatWaktu(item.created_at || item.tanggal)}</Text>
                </View>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6FA' },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerTitleWrap: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLOR_TEXT },
  headerSubtitle: { fontSize: 11.5, color: COLOR_PRIMARY, marginTop: 2, fontWeight: '600' },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },

  errorBanner: {
    backgroundColor: '#FDECEC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  errorText: { color: '#D64545', fontSize: 12.5 },

  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 90 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: COLOR_TEXT, marginTop: 14 },
  emptyText: { fontSize: 12.5, color: COLOR_SUBTEXT, marginTop: 4, textAlign: 'center' },

  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  notifCardUnread: {
    borderWidth: 1,
    borderColor: '#DCE5FE',
    backgroundColor: '#F7FAFF',
  },
  notifIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTextWrap: { flex: 1 },
  notifTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  notifCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: COLOR_PRIMARY,
    textTransform: 'capitalize',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E74C3C',
  },
  notifTitle: { fontSize: 13.5, fontWeight: '700', color: COLOR_TEXT, marginTop: 3 },
  notifBody: { fontSize: 11.5, color: COLOR_SUBTEXT, marginTop: 3, lineHeight: 16 },
  notifDate: { fontSize: 10.5, color: '#A0A5B0', marginTop: 6 },
})
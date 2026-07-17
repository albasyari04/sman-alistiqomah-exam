import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageBackground,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path, Circle } from 'react-native-svg'
import { useAuth } from '../../context/AuthContext'
import { getAllActiveExams } from '../../services/examService'
import { getResultsByStudent } from '../../services/resultService'
import { getPengumumanForStudent } from '../../services/pengumumanService'
import BottomNavSiswa from '../../components/BottomNavSiswa'

const ICONS = {
  totalUjian: require('../../../assets/icons/total-ujian-icon.png'),
  belumDikerjakan: require('../../../assets/icons/belum-di-kerjakan-icon.png'),
  ujianSelesai: require('../../../assets/icons/sudah-di-kerjakan-icon.png'),
  rataRataNilai: require('../../../assets/icons/rata2-nilai.png'),
  daftarUjian: require('../../../assets/icons/daftar-ujian-icon.png'),
  ujianSaya: require('../../../assets/icons/ujian-icon.png'),
  jadwal: require('../../../assets/icons/jadwal-ujian-icon.png'),
  pengumuman: require('../../../assets/icons/pengumuman-icon.png'),
  nilai: require('../../../assets/icons/nilai-icon.png'),
  profil: require('../../../assets/icons/profile-icon.png'),
  pengaturan: require('../../../assets/icons/pengaturan-icon.png'),
  welcomeBannerImg: require('../../../assets/icons/banner-atas.png'),
  ujianBerikutnyaBanner: require('../../../assets/icons/ujian-berikutnya-banner.png'),
  belIcon: require('../../../assets/icons/bel-icon.png'), // Tambahkan icon bel
}

// ---------- Icon SVG kecil ----------
// Hapus fungsi IconBell karena sudah diganti dengan gambar

function IconPlay({ color }) {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path d="M6 4.5v15l13-7.5-13-7.5Z" fill={color} />
    </Svg>
  )
}

function IconMegaphone({ color }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M4 10.5v3a1 1 0 0 0 1 1h1.5l7 3.3V6.7l-7 3.3H5a1 1 0 0 0-1 1Z" stroke={color} strokeWidth={1.7} strokeLinejoin="round" />
      <Path d="M17 9c1.2 1 1.2 4 0 5" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
      <Path d="M8 14.5v3a1.5 1.5 0 0 0 3 0v-1.7" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  )
}

function IconCalendarSmall({ color }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M4 5.5h16v14.5H4z" stroke={color} strokeWidth={1.7} strokeLinejoin="round" />
      <Path d="M4 9.5h16" stroke={color} strokeWidth={1.7} />
    </Svg>
  )
}

function IconCalendarTiny({ color }) {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path d="M4 5.5h16v14.5H4z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M4 9.5h16" stroke={color} strokeWidth={1.8} />
    </Svg>
  )
}

function IconClockTiny({ color }) {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={8} stroke={color} strokeWidth={1.8} />
      <Path d="M12 8v4.3l3 1.8" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

function IconPinTiny({ color }) {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Circle cx={12} cy={9.4} r={2.2} stroke={color} strokeWidth={1.8} />
    </Svg>
  )
}

function IconCheckCircleSmall({ color }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={8} stroke={color} strokeWidth={1.7} />
      <Path d="M8.5 12.3l2.3 2.3 4.7-4.9" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

// ---------- Helper tanggal ----------
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

function formatTanggalPendek(isoString) {
  if (!isoString) return '-'
  const d = new Date(isoString)
  return `${d.getDate()} ${BULAN_PENDEK[d.getMonth()]} ${d.getFullYear()}`
}

function formatJam(startIso, endIso) {
  if (!startIso) return '-'
  const pad = (n) => String(n).padStart(2, '0')
  const s = new Date(startIso)
  const startStr = `${pad(s.getHours())}.${pad(s.getMinutes())}`
  if (!endIso) return `${startStr} WIB`
  const e = new Date(endIso)
  const endStr = `${pad(e.getHours())}.${pad(e.getMinutes())}`
  return `${startStr} - ${endStr}`
}

function computeRemaining(targetIso) {
  if (!targetIso) return { jam: 0, menit: 0, detik: 0, total: 0 }
  const diffMs = new Date(targetIso).getTime() - Date.now()
  if (diffMs <= 0) return { jam: 0, menit: 0, detik: 0, total: 0 }
  const totalDetik = Math.floor(diffMs / 1000)
  return {
    jam: Math.floor(totalDetik / 3600),
    menit: Math.floor((totalDetik % 3600) / 60),
    detik: totalDetik % 60,
    total: totalDetik,
  }
}

function useCountdown(targetIso) {
  const [remaining, setRemaining] = useState(() => computeRemaining(targetIso))
  useEffect(() => {
    if (!targetIso) return
    const id = setInterval(() => setRemaining(computeRemaining(targetIso)), 1000)
    return () => clearInterval(id)
  }, [targetIso])
  return remaining
}

const pad2 = (n) => String(n).padStart(2, '0')

// ---------- Menu utama ----------
const MENU = [
  { key: 'daftar-ujian', label: 'Daftar Ujian', desc: 'Lihat semua ujian', icon: ICONS.daftarUjian, route: 'DaftarUjianSiswa' },
  { key: 'ujian', label: 'Ujian', desc: 'Kerjakan ujian', icon: ICONS.ujianSaya, route: 'DaftarUjianSiswa' },
  { key: 'jadwal', label: 'Jadwal', desc: 'Jadwal ujian', icon: ICONS.jadwal, route: 'JadwalUjianSiswa' },
  { key: 'pengumuman', label: 'Pengumuman', desc: 'Info terbaru', icon: ICONS.pengumuman, route: 'PengumumanSiswa' },
  { key: 'nilai', label: 'Nilai', desc: 'Lihat nilai', icon: ICONS.nilai, route: 'HasilUjianSiswa' },
  { key: 'profil', label: 'Profil', desc: 'Data diri', icon: ICONS.profil, route: 'ProfilSiswa' },
  { key: 'pengaturan', label: 'Pengaturan', desc: 'Akun & aplikasi', icon: ICONS.pengaturan, route: 'PengaturanSiswa' },
]

const PENGUMUMAN_CATEGORY_META = {
  umum: { icon: IconMegaphone, bg: '#EEE7FB', color: '#6B3FB0' },
  akademik: { icon: IconCalendarSmall, bg: '#E4ECFC', color: '#2F6FED' },
  ujian: { icon: IconCheckCircleSmall, bg: '#FDF1DE', color: '#E0982A' },
  libur: { icon: IconMegaphone, bg: '#E1F6E8', color: '#1FAE5C' },
}

export default function DashboardSiswa({ navigation }) {
  const { profile } = useAuth()
  const [avatarError, setAvatarError] = useState(false)
  const [exams, setExams] = useState([])
  const [results, setResults] = useState([])
  const [pengumuman, setPengumuman] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const loadData = useCallback(async () => {
    if (!profile?.id) return
    setError(null)
    const [examsRes, resultsRes, pengumumanRes] = await Promise.all([
      getAllActiveExams(),
      getResultsByStudent(profile.id),
      getPengumumanForStudent(),
    ])
    if (examsRes.error || resultsRes.error) {
      setError(examsRes.error?.message || resultsRes.error?.message || 'Gagal memuat data')
    } else {
      setExams(examsRes.data || [])
      setResults(resultsRes.data || [])
    }
    if (!pengumumanRes.error) {
      setPengumuman(pengumumanRes.data || [])
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
  const totalUjian = exams.length
  const ujianSelesai = results.length
  const belumDikerjakan = Math.max(totalUjian - ujianSelesai, 0)
  const rataRataNilai =
    results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length)
      : 0

  const STATS = [
    { key: 'total', label: 'Total Ujian', value: totalUjian, icon: ICONS.totalUjian, badge: '20% dari bulan lalu', badgeBg: '#E1F6E8', badgeColor: '#1FAE5C', iconBg: '#E1F6E8' },
    { key: 'belum', label: 'Belum Dikerjakan', value: belumDikerjakan, icon: ICONS.belumDikerjakan, badge: '15% dari minggu lalu', badgeBg: '#E1F6E8', badgeColor: '#1FAE5C', iconBg: '#E4ECFC' },
    { key: 'selesai', label: 'Ujian Selesai', value: ujianSelesai, icon: ICONS.ujianSelesai, badge: '30% dari bulan lalu', badgeBg: '#E1F6E8', badgeColor: '#1FAE5C', iconBg: '#FDF1DE' },
    { key: 'rata', label: 'Rata-rata Nilai', value: rataRataNilai, icon: ICONS.rataRataNilai, badge: '8% dari bulan lalu', badgeBg: '#E1F6E8', badgeColor: '#1FAE5C', iconBg: '#EEE7FB' },
  ]

  const examTerdekat = exams
    .filter((e) => !completedExamIds.has(e.id) && new Date(e.start_time).getTime() > Date.now())
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))[0]

  const countdown = useCountdown(examTerdekat?.start_time)

  const ujianAktif = [...exams]
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
    .slice(0, 5)

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.loadingCenter]} edges={['top']}>
        <ActivityIndicator size="large" color="#2F6FED" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.headerSection}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Halo, {profile?.full_name || 'Siswa'}</Text>
            <Text style={styles.subtitle}>
              {profile?.kelas || 'XII IPA-1'}{profile?.sekolah ? ` • ${profile.sekolah}` : ' • SMA Al Istiqomah'}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.bellButton}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('NotifikasiSiswa')}
            >
              <Image 
                source={ICONS.belIcon} 
                style={styles.bellIcon} 
                resizeMode="contain"
              />
              <View style={styles.bellDot} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('ProfilSiswa')}>
              {profile?.avatar_url && !avatarError ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={styles.avatar}
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarInitial}>
                    {(profile?.full_name || 'S').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2F6FED']} />}
      >
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Banner Selamat Datang */}
        <View style={styles.welcomeBannerWrap}>
          <Image
            source={ICONS.welcomeBannerImg}
            style={styles.welcomeBannerImg}
            resizeMode="cover"
          />
        </View>

        {/* Stat cards - grid 2x2 */}
        <View style={styles.statsGrid}>
          {STATS.map((s) => (
            <View key={s.key} style={styles.statCard}>
              <View style={styles.statCardTopRow}>
                <View style={[styles.statIconWrap, { backgroundColor: s.iconBg }]}>
                  <Image source={s.icon} style={styles.statIconImg} resizeMode="contain" />
                </View>
                <Text style={styles.statKebab}>⋮</Text>
              </View>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <View style={[styles.statBadge, { backgroundColor: s.badgeBg }]}>
                <Text style={[styles.statBadgeText, { color: s.badgeColor }]}>↑ {s.badge}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Menu Utama */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.menuScrollContent}
          style={styles.menuScroll}
        >
          {MENU.map((m) => (
            <TouchableOpacity
              key={m.key}
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => m.route && navigation.navigate(m.route)}
            >
              <View style={styles.menuIconWrap}>
                <Image source={m.icon} style={styles.menuIconImg} resizeMode="contain" />
              </View>
              <Text style={styles.menuLabel} numberOfLines={1}>{m.label}</Text>
              <Text style={styles.menuDesc} numberOfLines={1}>{m.desc}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Ujian Berikutnya - Full Width dengan Background Image */}
        <View style={styles.nextExamSection}>
          <View style={styles.colHeaderRow}>
            <Text style={styles.sectionTitle}>Ujian Berikutnya</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DaftarUjianSiswa')}>
              <Text style={styles.colSeeAll}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>

          {examTerdekat ? (
            <View style={styles.examBannerContainer}>
              <ImageBackground
                source={ICONS.ujianBerikutnyaBanner}
                style={styles.examBannerBackground}
                imageStyle={styles.examBannerImage}
                resizeMode="contain"
              >
                <View style={styles.examBannerOverlay}>
                  <Text style={styles.examSubject} numberOfLines={1}>
                    {examTerdekat.subject || examTerdekat.title}
                  </Text>
                  <Text style={styles.examType}>Ujian Akhir Semester</Text>

                  <View style={styles.examCountdownRow}>
                    <View style={styles.examCountdownItem}>
                      <Text style={styles.examCountdownValue}>{pad2(countdown.jam)}</Text>
                      <Text style={styles.examCountdownLabel}>Jam</Text>
                    </View>
                    <Text style={styles.examCountdownColon}>:</Text>
                    <View style={styles.examCountdownItem}>
                      <Text style={styles.examCountdownValue}>{pad2(countdown.menit)}</Text>
                      <Text style={styles.examCountdownLabel}>Menit</Text>
                    </View>
                    <Text style={styles.examCountdownColon}>:</Text>
                    <View style={styles.examCountdownItem}>
                      <Text style={styles.examCountdownValue}>{pad2(countdown.detik)}</Text>
                      <Text style={styles.examCountdownLabel}>Detik</Text>
                    </View>
                  </View>

                  <View style={styles.examMetaRow}>
                    <View style={styles.examMetaItem}>
                      <IconCalendarTiny color="#EAEFFE" />
                      <Text style={styles.examMetaItemText}>{formatTanggalPendek(examTerdekat.start_time)}</Text>
                    </View>
                    <View style={styles.examMetaItem}>
                      <IconClockTiny color="#EAEFFE" />
                      <Text style={styles.examMetaItemText}>
                        {formatJam(examTerdekat.start_time, examTerdekat.end_time)}
                      </Text>
                    </View>
                    {!!examTerdekat.ruang && (
                      <View style={styles.examMetaItem}>
                        <IconPinTiny color="#EAEFFE" />
                        <Text style={styles.examMetaItemText}>{examTerdekat.ruang}</Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.examButton}
                    activeOpacity={0.85}
                    onPress={() =>
                      navigation.navigate('KerjakanUjian', {
                        examId: examTerdekat.id,
                        examTitle: examTerdekat.subject || examTerdekat.title,
                        duration: examTerdekat.duration ?? examTerdekat.duration_minutes,
                      })
                    }
                  >
                    <IconPlay color="#2F6FED" />
                    <Text style={styles.examButtonText}>Mulai Ujian</Text>
                  </TouchableOpacity>
                </View>
              </ImageBackground>
            </View>
          ) : (
            <View style={[styles.examBannerContainer, styles.examEmptyInner]}>
              <Text style={styles.examEmptyTitle}>Tidak Ada Ujian Mendatang</Text>
              <Text style={styles.examEmptyText}>Semua ujian aktif sudah kamu kerjakan 🎉</Text>
            </View>
          )}
        </View>

        {/* Pengumuman Terbaru */}
        <View style={[styles.colCard, styles.pengumumanFullCard]}>
          <View style={styles.colHeaderRow}>
            <Text style={styles.colTitle}>Pengumuman Terbaru</Text>
            <TouchableOpacity onPress={() => navigation.navigate('PengumumanSiswa')}>
              <Text style={styles.colSeeAll}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>
          {pengumuman.length === 0 && (
            <Text style={styles.emptyText}>Belum ada pengumuman.</Text>
          )}
          {pengumuman.slice(0, 2).map((p) => {
            const meta = PENGUMUMAN_CATEGORY_META[p.category] || PENGUMUMAN_CATEGORY_META.umum
            return (
              <TouchableOpacity
                key={p.id}
                style={styles.pengumumanRow}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('PengumumanSiswa')}
              >
                <View style={[styles.pengumumanIconWrap, { backgroundColor: meta.bg }]}>
                  <Image source={ICONS.pengumuman} style={styles.pengumumanIconImg} resizeMode="contain" />
                </View>
                <View style={styles.pengumumanTextWrap}>
                  {(p.category || 'umum') === 'umum' ? null : (
                    <Text style={styles.pengumumanCategory}>{p.category}</Text>
                  )}
                  <Text style={styles.pengumumanLabel} numberOfLines={2}>{p.title}</Text>
                  {!!p.body && (
                    <Text style={styles.pengumumanBody} numberOfLines={1}>{p.body}</Text>
                  )}
                  <Text style={styles.pengumumanDate}>{formatTanggalPendek(p.created_at)}</Text>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Ujian Aktif */}
        <View style={styles.ujianAktifSection}>
          <View style={styles.colHeaderRow}>
            <Text style={styles.sectionTitle}>Ujian Aktif</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DaftarUjianSiswa')}>
              <Text style={styles.colSeeAll}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>

          {ujianAktif.length === 0 ? (
            <View style={styles.ujianAktifEmptyCard}>
              <Text style={styles.emptyText}>Tidak ada ujian aktif saat ini.</Text>
            </View>
          ) : (
            ujianAktif.map((exam) => {
              const sudahDikerjakan = completedExamIds.has(exam.id)
              return (
                <View key={exam.id} style={styles.ujianAktifCard}>
                  <Image source={ICONS.ujianSaya} style={styles.ujianAktifIcon} resizeMode="contain" />
                  <View style={styles.ujianAktifInfo}>
                    <Text style={styles.ujianAktifTitle} numberOfLines={1}>
                      {exam.subject || exam.title}
                    </Text>
                    <Text style={styles.ujianAktifMeta} numberOfLines={1}>
                      {formatTanggalPendek(exam.start_time)} • {formatJam(exam.start_time, exam.end_time)}
                    </Text>
                  </View>
                  {sudahDikerjakan ? (
                    <View style={styles.ujianAktifBadgeDone}>
                      <Text style={styles.ujianAktifBadgeDoneText}>Selesai</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.joinButton}
                      activeOpacity={0.85}
                      onPress={() =>
                        navigation.navigate('KerjakanUjian', {
                          examId: exam.id,
                          examTitle: exam.subject || exam.title,
                          duration: exam.duration ?? exam.duration_minutes,
                        })
                      }
                    >
                      <Text style={styles.joinButtonText}>Join Ujian</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )
            })
          )}
        </View>
      </ScrollView>

      <BottomNavSiswa navigation={navigation} active="Beranda" />
    </SafeAreaView>
  )
}

// =====================================================================
// STYLES
// =====================================================================

const CARD_SHADOW = {
  shadowColor: '#1A1D29',
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 3 },
  elevation: 2,
}

const COLOR_BG = '#F4F6FB'
const COLOR_PRIMARY = '#2F5FE8'
const COLOR_TEXT = '#1A1D29'
const COLOR_SUBTEXT = '#8B90A0'

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLOR_BG },
  loadingCenter: { alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 32 },
  errorBanner: { backgroundColor: '#FDECEA', borderRadius: 12, padding: 12, marginBottom: 14 },
  errorText: { color: '#c0392b', fontSize: 12.5 },
  emptyText: { color: '#A0A5B0', fontSize: 12, fontStyle: 'italic' },

  headerSection: {
    backgroundColor: COLOR_BG,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E7ED',
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: 19, fontWeight: '700', color: COLOR_TEXT },
  subtitle: { color: COLOR_SUBTEXT, marginTop: 3, fontSize: 13 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bellButton: { 
    width: 42, 
    height: 42, 
    borderRadius: 21, 
    backgroundColor: '#fff', 
    alignItems: 'center', 
    justifyContent: 'center', 
    ...CARD_SHADOW 
  },
  bellIcon: {
    width: 22,
    height: 22,
  },
  bellDot: { 
    position: 'absolute', 
    top: 9, 
    right: 10, 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: '#E74C3C', 
    borderWidth: 1.5, 
    borderColor: '#fff' 
  },
  avatar: { width: 46, height: 46, borderRadius: 23 },
  avatarFallback: { backgroundColor: COLOR_PRIMARY, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: '#fff', fontWeight: '700', fontSize: 17 },

  welcomeBannerWrap: {
    width: '100%',
    aspectRatio: 1969 / 799,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: COLOR_PRIMARY,
    marginBottom: 18,
    ...CARD_SHADOW,
  },
  welcomeBannerImg: { width: '100%', height: '100%' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  statCard: {
    width: '48.5%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    ...CARD_SHADOW,
  },
  statCardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  statIconWrap: { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  statIconImg: { width: 26, height: 26 },
  statKebab: { color: '#C3C7D1', fontSize: 16, fontWeight: '700' },
  statLabel: { fontSize: 12, color: COLOR_SUBTEXT, marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: '700', color: COLOR_TEXT, marginBottom: 8 },
  statBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statBadgeText: { fontSize: 10.5, fontWeight: '600' },

  menuScroll: { height: 108, marginBottom: 20, flexGrow: 0, flexShrink: 0 },
  menuScrollContent: { paddingRight: 20, alignItems: 'center' },
  menuItem: {
    width: 78,
    height: 96,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    ...CARD_SHADOW,
  },
  menuIconWrap: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  menuIconImg: { width: 32, height: 32 },
  menuLabel: { fontSize: 11.5, fontWeight: '700', color: COLOR_TEXT, textAlign: 'center' },
  menuDesc: { fontSize: 9, color: COLOR_SUBTEXT, textAlign: 'center', marginTop: 1 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLOR_TEXT },

  // Ujian Berikutnya - dengan ukuran lebih kecil
  nextExamSection: { marginBottom: 18 },
  examBannerContainer: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#2F5FE8',
    ...CARD_SHADOW,
  },
  examBannerBackground: {
    width: '100%',
    height: 200,
  },
  examBannerImage: {
    borderRadius: 18,
  },
  examBannerOverlay: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: 'rgba(47, 95, 232, 0.15)',
    justifyContent: 'space-between',
  },
  examEmptyInner: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLOR_PRIMARY,
    height: 200,
  },
  examEmptyTitle: { color: '#fff', fontSize: 13.5, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  examEmptyText: { color: '#EAEFFE', fontSize: 11, textAlign: 'center' },
  examSubject: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '700',
    marginBottom: 2,
  },
  examType: { 
    color: '#DCE5FE', 
    fontSize: 10.5, 
    marginBottom: 10,
  },
  examCountdownRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    gap: 4, 
    marginBottom: 10,
  },
  examCountdownItem: { alignItems: 'center' },
  examCountdownValue: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: '700' 
  },
  examCountdownLabel: { 
    color: '#DCE5FE', 
    fontSize: 8.5,
  },
  examCountdownColon: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '700', 
    marginBottom: 8,
  },
  examMetaRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    alignItems: 'center', 
    gap: 12, 
    marginBottom: 10,
  },
  examMetaItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 3,
  },
  examMetaItemText: { 
    color: '#EAEFFE', 
    fontSize: 10,
  },
  examButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 2,
  },
  examButtonText: { 
    color: COLOR_PRIMARY, 
    fontWeight: '700', 
    fontSize: 12,
  },

  // Pengumuman
  pengumumanFullCard: { marginBottom: 18 },
  colCard: { backgroundColor: '#fff', borderRadius: 18, padding: 14, ...CARD_SHADOW },
  colHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  colTitle: { fontSize: 13, fontWeight: '700', color: COLOR_TEXT },
  colSeeAll: { fontSize: 10.5, color: COLOR_PRIMARY, fontWeight: '600' },
  pengumumanRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 12 },
  pengumumanIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  pengumumanIconImg: { width: 20, height: 20 },
  pengumumanTextWrap: { flex: 1 },
  pengumumanCategory: { fontSize: 9.5, fontWeight: '700', color: COLOR_PRIMARY, marginBottom: 2, textTransform: 'capitalize' },
  pengumumanLabel: { fontSize: 11.5, fontWeight: '700', color: COLOR_TEXT, lineHeight: 14 },
  pengumumanBody: { fontSize: 10, color: COLOR_SUBTEXT, marginTop: 2 },
  pengumumanDate: { fontSize: 9.5, color: '#A0A5B0', marginTop: 3 },

  // Ujian Aktif
  ujianAktifSection: { marginBottom: 8 },
  ujianAktifEmptyCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, ...CARD_SHADOW },
  ujianAktifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    gap: 10,
    ...CARD_SHADOW,
  },
  ujianAktifIcon: { width: 38, height: 38 },
  ujianAktifInfo: { flex: 1 },
  ujianAktifTitle: { fontSize: 13.5, fontWeight: '700', color: COLOR_TEXT },
  ujianAktifMeta: { fontSize: 11, color: COLOR_SUBTEXT, marginTop: 2 },
  ujianAktifBadgeDone: { backgroundColor: '#E1F6E8', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  ujianAktifBadgeDoneText: { color: '#1FAE5C', fontSize: 11.5, fontWeight: '700' },
  joinButton: { backgroundColor: COLOR_PRIMARY, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10 },
  joinButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },
})
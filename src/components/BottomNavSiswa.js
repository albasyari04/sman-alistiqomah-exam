import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path, Circle, Rect } from 'react-native-svg'
import { useAuth } from '../context/AuthContext'
import { getAllActiveExams } from '../services/examService'
import { getResultsByStudent } from '../services/resultService'

function NavHomeIcon({ active }) {
  const c = active ? '#1B5E20' : '#A7ACA8'
  if (active) {
    return (
      <Svg width={23} height={23} viewBox="0 0 24 24" fill="none">
        <Path d="M4.2 11.2 12 4.4l7.8 6.8" stroke={c} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M6 10.3V19a1 1 0 0 0 1 1h3.2v-4.6a1.8 1.8 0 0 1 1.8-1.8 1.8 1.8 0 0 1 1.8 1.8V20H17a1 1 0 0 0 1-1v-8.7" fill={c}/>
      </Svg>
    )
  }
  return (
    <Svg width={23} height={23} viewBox="0 0 24 24" fill="none">
      <Path d="M4.2 11.2 12 4.4l7.8 6.8" stroke={c} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M6 10.3V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-8.7" stroke={c} strokeWidth={1.7} strokeLinejoin="round"/>
      <Path d="M10 20v-4.6a1.8 1.8 0 0 1 1.8-1.8 1.8 1.8 0 0 1 1.8 1.8V20" stroke={c} strokeWidth={1.7} strokeLinejoin="round"/>
    </Svg>
  )
}

function NavClipboardIcon({ active }) {
  const c = active ? '#1B5E20' : '#A7ACA8'
  return (
    <Svg width={23} height={23} viewBox="0 0 24 24" fill="none">
      <Path d="M8 4.5h8a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1Z" stroke={c} strokeWidth={1.7} strokeLinejoin="round" fill={active ? '#E4EFE5' : 'none'}/>
      <Path d="M9.3 4h5.4a.6.6 0 0 1 .6.6v1.2a.6.6 0 0 1-.6.6H9.3a.6.6 0 0 1-.6-.6V4.6a.6.6 0 0 1 .6-.6Z" fill={c}/>
      <Path d="M9 12.3l1.6 1.6L14.7 10" stroke={c} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M9 16.3h6" stroke={c} strokeWidth={1.5} strokeLinecap="round"/>
    </Svg>
  )
}

function NavCheckSquareIcon({ active }) {
  const c = active ? '#1B5E20' : '#A7ACA8'
  return (
    <Svg width={23} height={23} viewBox="0 0 24 24" fill="none">
      <Rect x={4.5} y={4.5} width={15} height={15} rx={3.5} stroke={c} strokeWidth={1.7} fill={active ? '#E4EFE5' : 'none'}/>
      <Path d="M8.3 12.3l2.2 2.2 5.2-5.2" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  )
}

function NavChartIcon({ active }) {
  const c = active ? '#1B5E20' : '#A7ACA8'
  return (
    <Svg width={23} height={23} viewBox="0 0 24 24" fill="none">
      <Rect x={4} y={13.2} width={3.4} height={6.8} rx={1.2} fill={c}/>
      <Rect x={10.3} y={8.4} width={3.4} height={11.6} rx={1.2} fill={c} opacity={active ? 1 : 0.85}/>
      <Rect x={16.6} y={4} width={3.4} height={16} rx={1.2} fill={c} opacity={active ? 1 : 0.7}/>
    </Svg>
  )
}

function NavProfileIcon({ active }) {
  const c = active ? '#1B5E20' : '#A7ACA8'
  return (
    <Svg width={23} height={23} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={3.6} fill={active ? c : 'none'} stroke={c} strokeWidth={1.7}/>
      <Path d="M5 20c0-3.7 3.1-6.3 7-6.3s7 2.6 7 6.3" fill={active ? c : 'none'} stroke={c} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  )
}

const TABS = [
  { key: 'Beranda', label: 'Beranda', route: 'DashboardSiswa', Icon: NavHomeIcon },
  { key: 'DaftarUjian', label: 'Daftar Ujian', route: 'DaftarUjianSiswa', Icon: NavClipboardIcon },
  // 'Ujian' TIDAK menuju daftar statis — ditangani khusus lewat handleMasukUjian()
  // supaya klik tab ini langsung "masuk" ke ujian yang belum dikerjakan.
  { key: 'Ujian', label: 'Ujian', route: 'DaftarUjianSiswa', Icon: NavCheckSquareIcon },
  { key: 'Nilai', label: 'Nilai', route: 'HasilUjianSiswa', Icon: NavChartIcon },
  { key: 'Profil', label: 'Profil', route: 'ProfilSiswa', Icon: NavProfileIcon },
]

/**
 * Bottom navigation siswa — reusable di semua screen siswa.
 * Props:
 * - navigation: object navigation dari React Navigation
 * - active: salah satu dari 'Beranda' | 'DaftarUjian' | 'Ujian' | 'Nilai' | 'Profil'
 *
 * Catatan: route 'ProfilSiswa' belum ada di SiswaStack.js — tambahkan screen
 * profil siswa di sana, atau ganti nama route sesuai screen yang sudah ada.
 */
export default function BottomNavSiswa({ navigation, active }) {
  const { profile } = useAuth()
  const [checkingUjian, setCheckingUjian] = useState(false)

  function goTo(routeName) {
    if (navigation?.navigate && routeName) {
      navigation.navigate(routeName)
    }
  }

  // Tab "Ujian" tidak membuka daftar statis. Ia mencari ujian aktif yang
  // BELUM dikerjakan siswa, lalu:
  // - kalau cuma ada 1 ujian yang bisa dikerjakan -> langsung buka KerjakanUjian
  // - kalau lebih dari 1 -> arahkan ke DaftarUjianSiswa supaya siswa memilih
  // - kalau tidak ada sama sekali -> tampilkan info, tidak pindah layar
  async function handleMasukUjian() {
    if (!navigation?.navigate) return

    if (!profile?.id) {
      goTo('DaftarUjianSiswa')
      return
    }

    setCheckingUjian(true)
    try {
      const [examsRes, resultsRes] = await Promise.all([
        getAllActiveExams(),
        getResultsByStudent(profile.id),
      ])

      if (examsRes.error || resultsRes.error) {
        Alert.alert('Gagal', 'Tidak bisa memuat data ujian. Coba lagi.')
        return
      }

      const completedIds = new Set((resultsRes.data || []).map((r) => r.exam_id))
      const belumDikerjakan = (examsRes.data || []).filter((e) => !completedIds.has(e.id))

      if (belumDikerjakan.length === 0) {
        Alert.alert('Tidak Ada Ujian', 'Tidak ada ujian yang bisa dikerjakan saat ini.')
        return
      }

      if (belumDikerjakan.length === 1) {
        const exam = belumDikerjakan[0]
        navigation.navigate('KerjakanUjian', {
          examId: exam.id,
          examTitle: exam.subject || exam.title,
          // TODO: sesuaikan nama kolom durasi ini dengan skema tabel exams
          // di examService (mis. duration_minutes) bila berbeda.
          duration: exam.duration ?? exam.duration_minutes,
        })
        return
      }

      navigation.navigate('DaftarUjianSiswa')
    } finally {
      setCheckingUjian(false)
    }
  }

  function handlePress(tab) {
    if (tab.key === 'Ujian') {
      handleMasukUjian()
      return
    }
    goTo(tab.route)
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.bottomNavSafeArea}>
      <View style={styles.bottomNav}>
        {TABS.map((tab) => {
          const isActive = active === tab.key
          const isLoadingTab = checkingUjian && tab.key === 'Ujian'
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.navItem}
              activeOpacity={0.7}
              disabled={isLoadingTab}
              onPress={() => handlePress(tab)}
            >
              <View style={[styles.navIconWrap, isActive && styles.navIconWrapActive]}>
                {isLoadingTab ? (
                  <ActivityIndicator size="small" color="#1B5E20" />
                ) : (
                  <tab.Icon active={isActive} />
                )}
              </View>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  bottomNavSafeArea: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  bottomNav: {
    flexDirection: 'row', paddingTop: 10, paddingBottom: 8, paddingHorizontal: 4,
    justifyContent: 'space-around',
  },
  navItem: { flex: 1, alignItems: 'center', gap: 3 },
  navIconWrap: {
    width: 44, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  },
  navIconWrapActive: { backgroundColor: '#E4EFE5' },
  navLabel: { fontSize: 9.5, color: '#A7ACA8', fontWeight: '500' },
  navLabelActive: { color: '#1B5E20', fontWeight: '700' },
})
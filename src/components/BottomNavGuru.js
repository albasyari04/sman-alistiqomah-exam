import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path, Circle, Rect } from 'react-native-svg'

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

function NavPeopleIcon({ active }) {
  const c = active ? '#1B5E20' : '#A7ACA8'
  return (
    <Svg width={23} height={23} viewBox="0 0 24 24" fill="none">
      <Circle cx={9} cy={7.6} r={3} fill={active ? c : 'none'} stroke={c} strokeWidth={1.7}/>
      <Path d="M3.3 20c0-3.2 2.6-5.3 5.7-5.3s5.7 2.1 5.7 5.3" fill={active ? c : 'none'} stroke={c} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"/>
      <Circle cx={17.2} cy={8.7} r={2.1} stroke={c} strokeWidth={1.6}/>
      <Path d="M15.6 14.3c2.3.35 3.8 2 3.8 4.9" stroke={c} strokeWidth={1.6} strokeLinecap="round"/>
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
  { key: 'Beranda', label: 'Beranda', route: 'DashboardGuru', Icon: NavHomeIcon },
  { key: 'Ujian', label: 'Ujian', route: 'DaftarUjianGuru', Icon: NavClipboardIcon },
  { key: 'Peserta', label: 'Peserta', route: 'PesertaUjian', Icon: NavPeopleIcon },
  { key: 'Hasil', label: 'Hasil', route: 'HasilUjian', Icon: NavChartIcon },
  { key: 'Profil', label: 'Profil', route: 'Profil', Icon: NavProfileIcon },
]

/**
 * Bottom navigation guru — reusable di semua screen guru.
 * Props:
 * - navigation: object navigation dari React Navigation
 * - active: salah satu dari 'Beranda' | 'Ujian' | 'Peserta' | 'Hasil' | 'Profil'
 */
export default function BottomNavGuru({ navigation, active }) {
  function goTo(routeName) {
    if (navigation?.navigate && routeName) {
      navigation.navigate(routeName)
    }
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.bottomNavSafeArea}>
      <View style={styles.bottomNav}>
        {TABS.map((tab) => {
          const isActive = active === tab.key
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.navItem}
              activeOpacity={0.7}
              onPress={() => goTo(tab.route)}
            >
              <View style={[styles.navIconWrap, isActive && styles.navIconWrapActive]}>
                <tab.Icon active={isActive} />
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
    flexDirection: 'row', paddingTop: 10, paddingBottom: 8, paddingHorizontal: 6,
    justifyContent: 'space-around',
  },
  navItem: { flex: 1, alignItems: 'center', gap: 3 },
  navIconWrap: {
    width: 44, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  },
  navIconWrapActive: { backgroundColor: '#E4EFE5' },
  navLabel: { fontSize: 10.5, color: '#A7ACA8', fontWeight: '500' },
  navLabelActive: { color: '#1B5E20', fontWeight: '700' },
})
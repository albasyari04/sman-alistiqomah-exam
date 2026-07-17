import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'
import BottomNavSiswa from '../../components/BottomNavSiswa'

function BellIcon2() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M6 10a6 6 0 1 1 12 0v4l1.5 3h-15L6 14v-4Z" stroke="#1B5E20" strokeWidth={1.6} strokeLinejoin="round"/>
      <Path d="M10 20a2 2 0 0 0 4 0" stroke="#1B5E20" strokeWidth={1.6} strokeLinecap="round"/>
    </Svg>
  )
}

function PaletteIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3.5A8.5 8.5 0 1 0 12 20.5c1.2 0 2-.9 2-2 0-.5-.2-.9-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-1.9 2-1.9h2.3c1.5 0 2.7-1.2 2.7-2.7 0-4.3-4-7.8-9-7.8Z"
        stroke="#1B5E20" strokeWidth={1.5} strokeLinejoin="round"
      />
      <Circle cx={7.5} cy={11} r={1.1} fill="#1B5E20"/>
      <Circle cx={9.5} cy={7.3} r={1.1} fill="#1B5E20"/>
      <Circle cx={14} cy={6.8} r={1.1} fill="#1B5E20"/>
    </Svg>
  )
}

function QuestionCircleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={8.5} stroke="#1B5E20" strokeWidth={1.6}/>
      <Path d="M9.8 9.5a2.2 2.2 0 1 1 3.2 2c-.7.5-1 .9-1 1.8" stroke="#1B5E20" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"/>
      <Circle cx={12} cy={16.6} r={0.9} fill="#1B5E20"/>
    </Svg>
  )
}

function InfoCircleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={8.5} stroke="#1B5E20" strokeWidth={1.6}/>
      <Path d="M12 11v5.3" stroke="#1B5E20" strokeWidth={1.6} strokeLinecap="round"/>
      <Circle cx={12} cy={8} r={0.9} fill="#1B5E20"/>
    </Svg>
  )
}

function ChevronRight({ color = '#BFC7C1' }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M9 6l6 6-6 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  )
}

// Route yang sudah terdaftar di SiswaStack.js dan aman untuk dinavigasi.
// Perbaikan: tambahkan semua route yang terdaftar di SiswaStack sehingga
// tombol dapat langsung menavigasi ke screen yang tersedia.
const AVAILABLE_ROUTES = [
  'NotifikasiSiswa',
  'PreferensiTampilanSiswa',
  'PusatBantuanSiswa',
  'TentangAplikasiSiswa',
]

const SECTIONS = [
  {
    title: 'Aplikasi',
    items: [
      { key: 'notifikasi', label: 'Notifikasi', desc: 'Lihat semua notifikasi', Icon: BellIcon2, route: 'NotifikasiSiswa' },
      { key: 'preferensi', label: 'Preferensi Tampilan', desc: 'Tema dan tampilan aplikasi', Icon: PaletteIcon, route: 'PreferensiTampilanSiswa' },
    ],
  },
  {
    title: 'Bantuan',
    items: [
      { key: 'bantuan', label: 'Pusat Bantuan', desc: 'FAQ dan panduan penggunaan', Icon: QuestionCircleIcon, route: 'PusatBantuanSiswa' },
      { key: 'tentang', label: 'Tentang Aplikasi', desc: 'Versi aplikasi dan informasi lainnya', Icon: InfoCircleIcon, route: 'TentangAplikasiSiswa' },
    ],
  },
]

export default function PengaturanSiswa({ navigation }) {
  function goToMenu(item) {
    if (AVAILABLE_ROUTES.includes(item.route)) {
      navigation.navigate(item.route)
      return
    }
    // Screen belum dibuat/didaftarkan di SiswaStack.js — tampilkan info
    // daripada memicu error navigasi seperti sebelumnya.
    Alert.alert('Segera Hadir', `Fitur "${item.label}" belum tersedia.`)
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {SECTIONS.map((section) => (
          <View key={section.title} style={{ marginBottom: 18 }}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.menuRow, idx !== section.items.length - 1 && styles.menuRowDivider]}
                  onPress={() => goToMenu(item)}
                >
                  <View style={styles.menuIconWrap}>
                    <item.Icon />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <Text style={styles.menuDesc}>{item.desc}</Text>
                  </View>
                  <ChevronRight />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <BottomNavSiswa navigation={navigation} active="" />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#F7F8FA' },
  scrollContent: { padding: 18, paddingTop: 20, paddingBottom: 24 },

  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#8A8A8A', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },

  menuCard: {
    backgroundColor: '#fff', borderRadius: 16,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
  menuRowDivider: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  menuIconWrap: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#E4EFE5',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  menuLabel: { fontSize: 14.5, color: '#1B1B1B', fontWeight: '600', marginBottom: 2 },
  menuDesc: { fontSize: 11.5, color: '#8A8A8A' },
})
import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path, Circle } from 'react-native-svg'

const COLOR_PRIMARY = '#1B5E20'
const COLOR_TEXT = '#1C2033'
const COLOR_SUBTEXT = '#8A8F9C'
const COLOR_BG = '#F4F6FA'

// ---------- Icon ----------
function IconBack({ color = COLOR_TEXT }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M15 5l-7 7 7 7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

function IconChevronDown({ color = '#BFC7C1', rotated }) {
  return (
    <Svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      style={{ transform: [{ rotate: rotated ? '180deg' : '0deg' }] }}
    >
      <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

function IconQuestion({ color }) {
  return (
    <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.6} />
      <Path d="M9.5 9.2a2.6 2.6 0 1 1 3.7 2.4c-.8.5-1.2 1-1.2 2" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={12} cy={16.8} r={1} fill={color} />
    </Svg>
  )
}

function IconWhatsapp({ color }) {
  return (
    <Svg width={19} height={19} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3.5a8.5 8.5 0 0 0-7.3 12.8L3.5 20.5l4.4-1.2A8.5 8.5 0 1 0 12 3.5Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Path
        d="M9 9.3c.2-.5.4-.5.7-.5h.5c.2 0 .4 0 .5.4.2.4.6 1.4.6 1.5.1.1.1.3 0 .4-.1.2-.2.3-.3.4-.1.1-.3.3-.4.4-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.2.1 1.5.7 1.8.8.3.1.5.2.5.3.1.4.1.7-.1 1-.2.3-1 1-2 1-.9 0-2.2-.3-3.7-1.3-2.3-1.5-3.7-3.7-3.9-3.9-.2-.2-1.4-1.9-1.4-3.6 0-1.7.9-2.5 1.2-2.8Z"
        fill={color}
      />
    </Svg>
  )
}

function IconMail({ color }) {
  return (
    <Svg width={19} height={19} viewBox="0 0 24 24" fill="none">
      <Path d="M4 6.5h16v11H4z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
      <Path d="M4.5 7l7.5 6 7.5-6" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    </Svg>
  )
}

const FAQ_LIST = [
  {
    key: 'lupa-sandi',
    q: 'Bagaimana cara reset password jika lupa?',
    a: 'Hubungi guru atau admin sekolah kamu untuk mengatur ulang password akun. Untuk saat ini, reset password mandiri belum tersedia di aplikasi.',
  },
  {
    key: 'ujian-terlewat',
    q: 'Kenapa status ujian saya "Waktu Habis" padahal belum dikerjakan?',
    a: 'Status ini muncul otomatis jika waktu ujian yang dijadwalkan sudah berakhir sebelum kamu mulai mengerjakan. Hubungi guru mata pelajaran terkait untuk kemungkinan ujian susulan.',
  },
  {
    key: 'koneksi-putus',
    q: 'Apa yang terjadi jika koneksi internet terputus saat ujian?',
    a: 'Jawaban yang sudah kamu isi biasanya tersimpan otomatis. Segera sambungkan kembali ke internet dan buka ulang ujian melalui menu "Ujian Aktif" di beranda.',
  },
  {
    key: 'nilai-belum-muncul',
    q: 'Nilai ujian saya belum muncul, kenapa?',
    a: 'Nilai akan muncul setelah guru selesai memeriksa dan mempublikasikan hasil ujian. Jika sudah lebih dari beberapa hari, silakan konfirmasi ke guru terkait.',
  },
  {
    key: 'ganti-kelas',
    q: 'Data kelas saya salah, bagaimana cara memperbaikinya?',
    a: 'Perubahan data kelas hanya bisa dilakukan oleh admin sekolah. Silakan laporkan ke wali kelas atau admin untuk pembaruan data.',
  },
]

export default function PusatBantuanSiswa({ navigation }) {
  const [openKey, setOpenKey] = useState(null)

  function toggle(key) {
    setOpenKey((prev) => (prev === key ? null : key))
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIconWrap}>
            <IconQuestion color={COLOR_PRIMARY} />
          </View>
          <Text style={styles.heroTitle}>Ada yang bisa kami bantu?</Text>
          <Text style={styles.heroDesc}>Cek pertanyaan yang sering diajukan di bawah ini.</Text>
        </View>

        {/* FAQ */}
        <Text style={styles.sectionLabel}>Pertanyaan Umum</Text>
        <View style={styles.faqCard}>
          {FAQ_LIST.map((item, idx) => {
            const open = openKey === item.key
            return (
              <View key={item.key} style={idx < FAQ_LIST.length - 1 && styles.faqRowBorder}>
                <TouchableOpacity style={styles.faqQuestionRow} activeOpacity={0.7} onPress={() => toggle(item.key)}>
                  <Text style={styles.faqQuestion}>{item.q}</Text>
                  <IconChevronDown rotated={open} />
                </TouchableOpacity>
                {open && (
                  <View style={styles.faqAnswerWrap}>
                    <Text style={styles.faqAnswer}>{item.a}</Text>
                  </View>
                )}
              </View>
            )
          })}
        </View>

        {/* Kontak */}
        <Text style={styles.sectionLabel}>Masih Butuh Bantuan?</Text>
        <View style={styles.groupCard}>
          <TouchableOpacity
            style={[styles.contactRow, styles.contactRowBorder]}
            activeOpacity={0.7}
            onPress={() => Linking.openURL('https://wa.me/6281234567890')}
          >
            <View style={[styles.contactIconWrap, { backgroundColor: '#E1F6E8' }]}>
              <IconWhatsapp color="#1FAE5C" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactLabel}>Chat WhatsApp Admin</Text>
              <Text style={styles.contactDesc}>Respon lebih cepat pada jam sekolah</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactRow}
            activeOpacity={0.7}
            onPress={() => Linking.openURL('mailto:admin@smanalistiqomah.sch.id')}
          >
            <View style={[styles.contactIconWrap, { backgroundColor: '#E4ECFC' }]}>
              <IconMail color="#2F6FED" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactLabel}>Kirim Email</Text>
              <Text style={styles.contactDesc}>admin@smanalistiqomah.sch.id</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLOR_BG },

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
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: COLOR_TEXT },

  scrollContent: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 40 },

  hero: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  heroIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E4EFE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroTitle: { fontSize: 15.5, fontWeight: '700', color: COLOR_TEXT, textAlign: 'center' },
  heroDesc: { fontSize: 12, color: COLOR_SUBTEXT, marginTop: 4, textAlign: 'center' },

  sectionLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLOR_SUBTEXT,
    marginBottom: 8,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  faqCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    overflow: 'hidden',
  },
  faqRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F1F5' },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  faqQuestion: { flex: 1, fontSize: 13, fontWeight: '700', color: COLOR_TEXT, lineHeight: 18 },
  faqAnswerWrap: { paddingHorizontal: 14, paddingBottom: 14 },
  faqAnswer: { fontSize: 12, color: COLOR_SUBTEXT, lineHeight: 18 },

  groupCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    overflow: 'hidden',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  contactRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F1F5' },
  contactIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLabel: { fontSize: 13.5, fontWeight: '700', color: COLOR_TEXT },
  contactDesc: { fontSize: 11, color: COLOR_SUBTEXT, marginTop: 1 },
})
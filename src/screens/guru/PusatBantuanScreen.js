import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import Svg, { Path } from 'react-native-svg'

const FAQS = [
  { q: 'Bagaimana cara membuat ujian baru?', a: 'Buka menu Ujian, lalu tekan tombol "Buat Ujian Baru" di Beranda. Isi judul, mata pelajaran, durasi, dan waktu mulai/selesai.' },
  { q: 'Bagaimana cara menambah soal?', a: 'Setelah ujian dibuat, buka daftar ujian dan tekan "Tambah Soal" untuk input manual, atau "Import CSV/Word" untuk mengimpor dari file.' },
  { q: 'Kenapa hasil ujian siswa belum muncul?', a: 'Hasil hanya muncul setelah siswa menekan tombol submit ujian. Pastikan waktu ujian sudah berjalan dan siswa sudah login.' },
  { q: 'Bagaimana cara reset password?', a: 'Buka Profil > Keamanan Akun, lalu masukkan password baru dan konfirmasinya.' },
]

function ChevronDown({ open }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
      <Path d="M6 9l6 6 6-6" stroke="#1B5E20" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  )
}

export default function PusatBantuanScreen() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>Pertanyaan Umum</Text>
      {FAQS.map((item, idx) => {
        const open = openIndex === idx
        return (
          <View key={idx} style={styles.card}>
            <TouchableOpacity style={styles.qRow} onPress={() => setOpenIndex(open ? null : idx)}>
              <Text style={styles.question}>{item.q}</Text>
              <ChevronDown open={open} />
            </TouchableOpacity>
            {open && <Text style={styles.answer}>{item.a}</Text>}
          </View>
        )
      })}

      <Text style={styles.contactTitle}>Butuh bantuan lebih lanjut?</Text>
      <Text style={styles.contactDesc}>Hubungi admin sekolah melalui email atau WhatsApp yang tertera di menu Tentang Aplikasi.</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },
  title: { fontSize: 16, fontWeight: '700', color: '#1B1B1B', marginBottom: 14 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10 },
  qRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  question: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1B1B1B', marginRight: 8 },
  answer: { fontSize: 13, color: '#666', marginTop: 10, lineHeight: 19 },
  contactTitle: { fontSize: 14, fontWeight: '700', color: '#1B1B1B', marginTop: 20, marginBottom: 6 },
  contactDesc: { fontSize: 12.5, color: '#888', lineHeight: 18 },
})
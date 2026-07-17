import { View, Text, StyleSheet, ScrollView } from 'react-native'
import Constants from 'expo-constants'

export default function TentangAplikasiScreen() {
  const version = Constants.expoConfig?.version || '1.0.0'

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.appName}>Aplikasi Ujian SMAN Al-Istiqomah</Text>
      <Text style={styles.version}>Versi {version}</Text>

      <Text style={styles.paragraph}>
        Aplikasi ini digunakan untuk mengelola ujian, soal, dan hasil belajar siswa secara digital di lingkungan SMAN Al-Istiqomah.
      </Text>

      <Text style={styles.sectionTitle}>Kontak</Text>
      <Text style={styles.contactItem}>Email: admin@sman-alistiqomah.sch.id</Text>
      <Text style={styles.contactItem}>WhatsApp: 08xx-xxxx-xxxx</Text>

      <Text style={styles.footer}>© {new Date().getFullYear()} SMAN Al-Istiqomah</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  appName: { fontSize: 18, fontWeight: '800', color: '#1B1B1B', marginBottom: 4 },
  version: { fontSize: 13, color: '#888', marginBottom: 20 },
  paragraph: { fontSize: 13.5, color: '#444', lineHeight: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#888', marginBottom: 8, textTransform: 'uppercase' },
  contactItem: { fontSize: 13.5, color: '#1B1B1B', marginBottom: 6 },
  footer: { fontSize: 11.5, color: '#aaa', marginTop: 32, textAlign: 'center' },
})
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native'
import { useSettings } from '../../context/SettingsContext'

export default function PreferensiTampilanScreen() {
  const { isDark, toggleDarkMode, language, setLanguage } = useSettings()

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Mode Gelap</Text>
          <Text style={styles.desc}>Ubah tampilan aplikasi jadi lebih gelap</Text>
        </View>
        <Switch
          value={isDark}
          onValueChange={toggleDarkMode}
          trackColor={{ false: '#ccc', true: '#A5D6A7' }}
          thumbColor={isDark ? '#1B5E20' : '#f4f3f4'}
        />
      </View>

      <Text style={styles.sectionTitle}>Bahasa</Text>
      {['id', 'en'].map((lang) => (
        <TouchableOpacity key={lang} style={styles.langRow} onPress={() => setLanguage(lang)}>
          <View style={[styles.radio, language === lang && styles.radioActive]} />
          <Text style={styles.langLabel}>{lang === 'id' ? 'Bahasa Indonesia' : 'English'}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0', marginBottom: 20,
  },
  label: { fontSize: 14.5, fontWeight: '600', color: '#1B1B1B', marginBottom: 2 },
  desc: { fontSize: 12, color: '#888' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#888', marginBottom: 10, textTransform: 'uppercase' },
  langRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#ccc', marginRight: 12 },
  radioActive: { borderColor: '#1B5E20', backgroundColor: '#1B5E20' },
  langLabel: { fontSize: 14, color: '#1B1B1B' },
})
import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path, Circle, Rect } from 'react-native-svg'

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

function IconSun({ color }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={4.2} stroke={color} strokeWidth={1.7} />
      <Path
        d="M12 3v2.2M12 18.8V21M21 12h-2.2M5.2 12H3M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6M18.4 18.4l-1.6-1.6M7.2 7.2 5.6 5.6"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </Svg>
  )
}

function IconMoon({ color }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
    </Svg>
  )
}

function IconAuto({ color }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.7} />
      <Path d="M12 3v18" stroke={color} strokeWidth={1.7} />
      <Path d="M12 3a9 9 0 0 1 0 18Z" fill={color} opacity={0.15} />
    </Svg>
  )
}

function IconCheck({ color }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12.5l4.5 4.5L19 7" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

const THEME_OPTIONS = [
  { key: 'terang', label: 'Terang', desc: 'Tampilan cerah untuk siang hari', Icon: IconSun },
  { key: 'gelap', label: 'Gelap', desc: 'Nyaman di mata saat malam hari', Icon: IconMoon },
  { key: 'otomatis', label: 'Otomatis', desc: 'Mengikuti pengaturan perangkat', Icon: IconAuto },
]

const TEXT_SIZE_OPTIONS = [
  { key: 'kecil', label: 'A', scale: 12 },
  { key: 'sedang', label: 'A', scale: 15 },
  { key: 'besar', label: 'A', scale: 18 },
]

export default function PreferensiTampilanSiswa({ navigation }) {
  const [theme, setTheme] = useState('otomatis')
  const [textSize, setTextSize] = useState('sedang')

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Mode Tampilan */}
        <Text style={styles.sectionLabel}>Mode Tampilan</Text>
        <View style={styles.groupCard}>
          {THEME_OPTIONS.map((opt, idx) => {
            const active = theme === opt.key
            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.optionRow, idx < THEME_OPTIONS.length - 1 && styles.optionRowBorder]}
                activeOpacity={0.7}
                onPress={() => setTheme(opt.key)}
              >
                <View style={[styles.optionIconWrap, active && styles.optionIconWrapActive]}>
                  <opt.Icon color={active ? '#fff' : COLOR_PRIMARY} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionLabel}>{opt.label}</Text>
                  <Text style={styles.optionDesc}>{opt.desc}</Text>
                </View>
                {active && (
                  <View style={styles.checkBadge}>
                    <IconCheck color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Ukuran Teks */}
        <Text style={styles.sectionLabel}>Ukuran Teks</Text>
        <View style={[styles.groupCard, styles.textSizeCard]}>
          {TEXT_SIZE_OPTIONS.map((opt) => {
            const active = textSize === opt.key
            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.textSizeOption, active && styles.textSizeOptionActive]}
                activeOpacity={0.7}
                onPress={() => setTextSize(opt.key)}
              >
                <Text
                  style={[
                    styles.textSizeLabel,
                    { fontSize: opt.scale },
                    active && styles.textSizeLabelActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Perubahan preferensi tampilan akan diterapkan ke seluruh aplikasi. Beberapa pengaturan mungkin
            memerlukan aplikasi dimuat ulang agar terlihat maksimal.
          </Text>
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

  sectionLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLOR_SUBTEXT,
    marginBottom: 8,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
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
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  optionRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F5',
  },
  optionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E4EFE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconWrapActive: {
    backgroundColor: COLOR_PRIMARY,
  },
  optionLabel: { fontSize: 13.5, fontWeight: '700', color: COLOR_TEXT },
  optionDesc: { fontSize: 11, color: COLOR_SUBTEXT, marginTop: 1 },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLOR_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },

  textSizeCard: {
    flexDirection: 'row',
    padding: 8,
    justifyContent: 'space-between',
  },
  textSizeOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  textSizeOptionActive: {
    backgroundColor: '#E4EFE5',
  },
  textSizeLabel: { fontWeight: '700', color: COLOR_SUBTEXT },
  textSizeLabelActive: { color: COLOR_PRIMARY },

  infoBox: {
    backgroundColor: '#EAF3EA',
    borderRadius: 14,
    padding: 14,
  },
  infoText: { fontSize: 11.5, color: '#3A6B3C', lineHeight: 17 },
})
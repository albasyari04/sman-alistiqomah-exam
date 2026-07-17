import { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path, Circle } from 'react-native-svg'
import { getPengumumanForStudent } from '../../services/pengumumanService'
import BottomNavSiswa from '../../components/BottomNavSiswa'

function IconMegaphoneEmpty({ color }) {
  return (
    <Svg width={46} height={46} viewBox="0 0 24 24" fill="none">
      <Path d="M4 10v4a1 1 0 0 0 1 1h2l7 4V5L7 9H5a1 1 0 0 0-1 1Z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      <Circle cx={18.5} cy={12} r={2.2} stroke={color} strokeWidth={1.5} />
    </Svg>
  )
}

const CATEGORIES = [
  { key: 'semua', label: 'Semua', color: '#1B5E20', bg: '#E4EFE5' },
  { key: 'umum', label: 'Umum', color: '#8E5FD8', bg: '#F1EAFB' },
  { key: 'akademik', label: 'Akademik', color: '#1B5E20', bg: '#E4EFE5' },
  { key: 'ujian', label: 'Ujian', color: '#B9770E', bg: '#FDF2E3' },
  { key: 'libur', label: 'Libur', color: '#1F6FB2', bg: '#E3F0FB' },
]

function categoryInfo(key) {
  return CATEGORIES.find((c) => c.key === key) || CATEGORIES[1]
}

function formatTanggal(iso) {
  const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const d = new Date(iso)
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`
}

export default function PengumumanSiswa({ navigation }) {
  const [items, setItems] = useState([])
  const [activeCategory, setActiveCategory] = useState('semua')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const loadData = useCallback(async () => {
    setError(null)
    const { data, error: fetchError } = await getPengumumanForStudent()
    if (fetchError) setError(fetchError.message)
    else setItems(data || [])
  }, [])

  useEffect(() => {
    setLoading(true)
    loadData().finally(() => setLoading(false))
  }, [loadData])

  async function onRefresh() {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const filteredItems = activeCategory === 'semua'
    ? items
    : items.filter((i) => i.category === activeCategory)

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]} edges={['top']}>
        <ActivityIndicator size="large" color="#1B5E20" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
        style={styles.tabsScroll}
      >
        {CATEGORIES.map((c) => {
          const active = activeCategory === c.key
          return (
            <TouchableOpacity
              key={c.key}
              style={[styles.tabChip, active && { backgroundColor: c.color, borderColor: c.color }]}
              onPress={() => setActiveCategory(c.key)}
            >
              <Text style={[styles.tabChipText, active && styles.tabChipTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1B5E20']} />}
      >
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {filteredItems.length === 0 && !error && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <IconMegaphoneEmpty color="#B7BCB8" />
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Pengumuman</Text>
            <Text style={styles.emptyDesc}>Pengumuman terbaru untuk kelasmu akan muncul di sini.</Text>
          </View>
        )}

        {filteredItems.map((item) => {
          const cat = categoryInfo(item.category)
          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={[styles.catBadge, { backgroundColor: cat.bg }]}>
                  <Text style={[styles.catBadgeText, { color: cat.color }]}>{cat.label}</Text>
                </View>
                <Text style={styles.cardDate}>{formatTanggal(item.created_at)}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardContent}>{item.content}</Text>
            </View>
          )
        })}
      </ScrollView>

      <BottomNavSiswa navigation={navigation} active="Pengumuman" />
    </SafeAreaView>
  )
}

const CARD_SHADOW = {
  shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2,
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7F5' },
  center: { alignItems: 'center', justifyContent: 'center' },

  tabsScroll: { flexGrow: 0, backgroundColor: '#F5F7F5' },
  tabsRow: { paddingHorizontal: 20, paddingVertical: 14, gap: 8 },
  tabChip: {
    borderWidth: 1.3, borderColor: '#DDE2DE', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: '#fff',
  },
  tabChipText: { fontSize: 12.5, fontWeight: '600', color: '#5A5F5B' },
  tabChipTextActive: { color: '#fff' },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 110 },

  errorBanner: { backgroundColor: '#FDECEA', borderRadius: 12, padding: 12, marginBottom: 14 },
  errorText: { color: '#c0392b', fontSize: 12.5 },

  emptyState: { alignItems: 'center', paddingTop: 70, paddingHorizontal: 30 },
  emptyIconWrap: {
    width: 84, height: 84, borderRadius: 42, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16, ...CARD_SHADOW,
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#1A1D1B', marginBottom: 6 },
  emptyDesc: { fontSize: 12.5, color: '#8A8F8B', textAlign: 'center', lineHeight: 18 },

  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, ...CARD_SHADOW },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  catBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  catBadgeText: { fontSize: 10.5, fontWeight: '700' },
  cardDate: { fontSize: 11, color: '#A7ACA8' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1A1D1B', marginBottom: 6 },
  cardContent: { fontSize: 12.5, color: '#5A5F5B', lineHeight: 19 },
})
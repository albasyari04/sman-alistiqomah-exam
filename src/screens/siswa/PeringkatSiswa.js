import { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../context/AuthContext'
import { getOverallRanking } from '../../services/resultService'
import BottomNavSiswa from '../../components/BottomNavSiswa'

const MEDAL_COLORS = { 1: '#F4B400', 2: '#B0B7BD', 3: '#CD7F32' }

export default function PeringkatSiswa({ navigation }) {
  const { profile } = useAuth()
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const loadData = useCallback(async () => {
    setError(null)
    const { data, error } = await getOverallRanking()
    if (error) {
      setError(error.message || 'Gagal memuat peringkat')
    } else {
      setRanking(data || [])
    }
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

  function renderItem({ item }) {
    const isMe = item.studentId === profile?.id
    return (
      <View style={[styles.row, isMe && styles.rowMe]}>
        <View style={[styles.rankBadge, item.rank <= 3 && { backgroundColor: MEDAL_COLORS[item.rank] }]}>
          <Text style={[styles.rankText, item.rank <= 3 && styles.rankTextMedal]}>{item.rank}</Text>
        </View>
        <View style={styles.infoWrap}>
          <Text style={styles.name} numberOfLines={1}>
            {item.fullName}{isMe ? ' (Anda)' : ''}
          </Text>
          <Text style={styles.meta}>{item.kelas} • {item.totalUjian} ujian</Text>
        </View>
        <Text style={styles.score}>{item.rataRata}</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>Peringkat</Text>
        <Text style={styles.subtitle}>Rata-rata nilai seluruh siswa, lintas semua ujian</Text>
      </View>

      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#1B5E20" />
        </View>
      ) : (
        <FlatList
          data={ranking}
          keyExtractor={(item) => item.studentId}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1B5E20']} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {error || 'Belum ada data nilai untuk ditampilkan.'}
            </Text>
          }
        />
      )}

      <BottomNavSiswa navigation={navigation} active="Peringkat" />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7F5' },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerSection: {
    backgroundColor: '#F5F7F5',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E9E6',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#1A1D1B' },
  subtitle: { color: '#777', marginTop: 3, fontSize: 13 },

  listContent: { padding: 20, paddingBottom: 32, flexGrow: 1 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 14, padding: 12, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  rowMe: { borderWidth: 1.5, borderColor: '#1B5E20' },
  rankBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E4EFE5', alignItems: 'center', justifyContent: 'center' },
  rankText: { fontWeight: '700', color: '#1B5E20', fontSize: 13 },
  rankTextMedal: { color: '#fff' },
  infoWrap: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', color: '#1A1D1B' },
  meta: { fontSize: 11.5, color: '#8A8F8B', marginTop: 2 },
  score: { fontSize: 17, fontWeight: '700', color: '#1B5E20' },
  emptyText: { textAlign: 'center', color: '#A0A5A1', fontStyle: 'italic', marginTop: 40 },
})
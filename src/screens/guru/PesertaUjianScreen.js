import { useCallback, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import Svg, { Circle, Path } from 'react-native-svg'
import BottomNavGuru from '../../components/BottomNavGuru'
import { getAllPeserta } from '../../services/profileService'

function PeopleIllustration() {
  return (
    <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
      <Circle cx={9} cy={8} r={3.2} stroke="#1E88E5" strokeWidth={1.6}/>
      <Path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" stroke="#1E88E5" strokeWidth={1.6} strokeLinecap="round"/>
      <Circle cx={17.3} cy={9} r={2.4} stroke="#1E88E5" strokeWidth={1.6}/>
      <Path d="M15.5 14.7c2.6.3 4.5 2.2 4.5 5.3" stroke="#1E88E5" strokeWidth={1.6} strokeLinecap="round"/>
    </Svg>
  )
}

function getInitial(name) {
  if (!name) return '?'
  return name.trim().charAt(0).toUpperCase()
}

function PesertaItem({ item }) {
  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitial(item.full_name)}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.full_name || 'Tanpa nama'}</Text>
        <Text style={styles.cardKelas}>
          {item.kelas ? item.kelas : 'Kelas belum diisi'}
        </Text>
      </View>
    </View>
  )
}

export default function PesertaUjianScreen({ navigation }) {
  const [peserta, setPeserta] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  async function fetchPeserta() {
    const { data, error } = await getAllPeserta()
    if (error) {
      setErrorMsg('Gagal memuat data peserta. Coba lagi.')
      console.log('Gagal ambil peserta:', error.message)
    } else {
      setErrorMsg(null)
      setPeserta(data || [])
    }
  }

  useFocusEffect(
    useCallback(() => {
      setLoading(true)
      fetchPeserta().finally(() => setLoading(false))
    }, [])
  )

  async function onRefresh() {
    setRefreshing(true)
    await fetchPeserta()
    setRefreshing(false)
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.screen}>
        {loading ? (
          <ActivityIndicator size="large" color="#1E88E5" />
        ) : errorMsg ? (
          <View style={styles.centerContent}>
            <View style={styles.iconWrap}>
              <PeopleIllustration />
            </View>
            <Text style={styles.title}>Terjadi kesalahan</Text>
            <Text style={styles.desc}>{errorMsg}</Text>
          </View>
        ) : peserta.length === 0 ? (
          <View style={styles.centerContent}>
            <View style={styles.iconWrap}>
              <PeopleIllustration />
            </View>
            <Text style={styles.title}>Belum ada peserta</Text>
            <Text style={styles.desc}>
              Peserta ujian akan muncul di sini setelah{'\n'}mereka mendaftar/login.
            </Text>
          </View>
        ) : (
          <FlatList
            data={peserta}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <PesertaItem item={item} />}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListHeaderComponent={
              <Text style={styles.headerCount}>
                {peserta.length} peserta terdaftar
              </Text>
            }
          />
        )}
      </View>

      <BottomNavGuru navigation={navigation} active="Peserta" />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#F7F8FA' },
  screen: { flex: 1, padding: 16 },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#1B1B1B', marginBottom: 8 },
  desc: { fontSize: 13, color: '#8A8A8A', textAlign: 'center', lineHeight: 19 },
  headerCount: {
    fontSize: 13,
    color: '#8A8A8A',
    marginBottom: 12,
    marginLeft: 4,
  },
  listContent: { paddingBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#1E88E5' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 14, fontWeight: '600', color: '#1B1B1B' },
  cardKelas: { fontSize: 12, color: '#8A8A8A', marginTop: 2 },
})
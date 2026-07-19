import { Platform } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import DashboardSiswa from '../screens/siswa/DashboardSiswa'
import NotifikasiSiswa from '../screens/siswa/NotifikasiSiswa'
import DaftarUjianSiswa from '../screens/siswa/DaftarUjianSiswa'
import JadwalUjianSiswa from '../screens/siswa/JadwalUjianSiswa'
import PengumumanSiswa from '../screens/siswa/PengumumanSiswa'
import KerjakanUjianScreen from '../screens/siswa/KerjakanUjianScreen'
import HasilUjianSiswa from '../screens/siswa/HasilUjianSiswa'
import PeringkatSiswa from '../screens/siswa/PeringkatSiswa'
import ProfilSiswa from '../screens/siswa/ProfilSiswa'
import PengaturanSiswa from '../screens/siswa/PengaturanSiswa'
import PusatBantuanSiswa from '../screens/siswa/PusatBantuanSiswa'
import TentangAplikasiSiswa from '../screens/siswa/TentangAplikasiSiswa'
import PreferensiTampilanSiswa from '../screens/siswa/PreferensiTampilanSiswa'

const Stack = Platform.OS === 'web' ? createStackNavigator() : createNativeStackNavigator()

export default function SiswaStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: { flex: 1, height: '100%' },
        cardStyle: { flex: 1, backgroundColor: '#fff' },
      }}
    >
      <Stack.Screen name="DashboardSiswa" component={DashboardSiswa} options={{ headerShown: false }} />
      <Stack.Screen name="NotifikasiSiswa" component={NotifikasiSiswa} options={{ headerShown: false }} />
      <Stack.Screen name="DaftarUjianSiswa" component={DaftarUjianSiswa} options={{ title: 'Daftar Ujian' }} />
      <Stack.Screen name="JadwalUjianSiswa" component={JadwalUjianSiswa} options={{ title: 'Jadwal Ujian' }} />
      <Stack.Screen name="PengumumanSiswa" component={PengumumanSiswa} options={{ title: 'Pengumuman' }} />
      <Stack.Screen name="KerjakanUjian" component={KerjakanUjianScreen} options={{ title: 'Kerjakan Ujian' }} />
      <Stack.Screen name="HasilUjianSiswa" component={HasilUjianSiswa} options={{ title: 'Hasil Ujian' }} />
      <Stack.Screen name="PeringkatSiswa" component={PeringkatSiswa} options={{ title: 'Peringkat' }} />
      <Stack.Screen name="ProfilSiswa" component={ProfilSiswa} options={{ headerShown: false }} />
      <Stack.Screen name="PengaturanSiswa" component={PengaturanSiswa} options={{ title: 'Pengaturan' }} />
      <Stack.Screen name="PusatBantuanSiswa" component={PusatBantuanSiswa} options={{ title: 'Pusat Bantuan' }} />
      <Stack.Screen name="TentangAplikasiSiswa" component={TentangAplikasiSiswa} options={{ title: 'Tentang Aplikasi'}} />
      <Stack.Screen name="PreferensiTampilanSiswa" component={PreferensiTampilanSiswa} options={{ title: 'Preferensi Tampilan'}} />
    </Stack.Navigator>
  )
}
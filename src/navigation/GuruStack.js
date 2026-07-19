import { Platform } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import DashboardGuru from '../screens/guru/DashboardGuru'
import BuatUjianScreen from '../screens/guru/BuatUjianScreen'
import DaftarUjianGuru from '../screens/guru/DaftarUjianGuru'
import TambahSoalScreen from '../screens/guru/TambahSoalScreen'
import ImportSoalScreen from '../screens/guru/ImportSoalScreen'
import HasilUjianGuru from '../screens/guru/HasilUjianGuru'
import ReviewJawabanScreen from '../screens/guru/ReviewJawabanScreen'
import PesertaUjianScreen from '../screens/guru/PesertaUjianScreen'
import BankSoalScreen from '../screens/guru/BankSoalScreen'
import EditSoalScreen from '../screens/guru/EditSoalScreen'
import PengaturanScreen from '../screens/guru/PengaturanScreen'
import PengumumanScreen from '../screens/guru/PengumumanScreen'
import ProfilScreen from '../screens/guru/ProfilScreen'
import InformasiPribadiScreen from '../screens/guru/InformasiPribadiScreen'
import KeamananAkunScreen from '../screens/guru/KeamananAkunScreen'
import NotifikasiScreen from '../screens/guru/NotifikasiScreen'
import PreferensiTampilanScreen from '../screens/guru/PreferensiTampilanScreen'
import PusatBantuanScreen from '../screens/guru/PusatBantuanScreen'
import TentangAplikasiScreen from '../screens/guru/TentangAplikasiScreen'

const Stack = Platform.OS === 'web' ? createStackNavigator() : createNativeStackNavigator()

export default function GuruStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: { flex: 1, height: '100%' },
        cardStyle: { flex: 1, backgroundColor: '#fff' },
      }}
    >
      <Stack.Screen name="DashboardGuru" component={DashboardGuru} options={{ headerShown: false }} />
      <Stack.Screen name="BuatUjian" component={BuatUjianScreen} options={{ title: 'Buat Ujian' }} />
      <Stack.Screen name="DaftarUjianGuru" component={DaftarUjianGuru} options={{ title: 'Daftar Ujian' }} />
      <Stack.Screen name="TambahSoal" component={TambahSoalScreen} options={{ title: 'Tambah Soal' }} />
      <Stack.Screen name="ImportSoal" component={ImportSoalScreen} options={{ title: 'Import Soal' }} />
      <Stack.Screen name="HasilUjian" component={HasilUjianGuru} options={{ title: 'Hasil Ujian' }} />
      <Stack.Screen name="ReviewJawaban" component={ReviewJawabanScreen} />
      <Stack.Screen name="PesertaUjian" component={PesertaUjianScreen} options={{ title: 'Peserta Ujian' }} />
      <Stack.Screen name="BankSoal" component={BankSoalScreen} options={{ title: 'Bank Soal' }} />
      <Stack.Screen name="EditSoal" component={EditSoalScreen} options={{ title: 'Edit Soal' }} />
      <Stack.Screen name="Pengaturan" component={PengaturanScreen} options={{ title: 'Pengaturan' }} />
      <Stack.Screen name="Pengumuman" component={PengumumanScreen} options={{ title: 'Pengumuman' }} />
      <Stack.Screen name="Profil" component={ProfilScreen} options={{ title: 'Profil' }} />
      <Stack.Screen name="InformasiPribadi" component={InformasiPribadiScreen} options={{ title: 'Informasi Pribadi' }} />
      <Stack.Screen name="KeamananAkun" component={KeamananAkunScreen} options={{ title: 'Keamanan Akun' }} />
      <Stack.Screen name="NotifikasiSetting" component={NotifikasiScreen} options={{ title: 'Notifikasi' }} />
      <Stack.Screen name="PreferensiTampilan" component={PreferensiTampilanScreen} options={{ title: 'Preferensi Tampilan' }} />
      <Stack.Screen name="PusatBantuan" component={PusatBantuanScreen} options={{ title: 'Pusat Bantuan' }} />
      <Stack.Screen name="TentangAplikasi" component={TentangAplikasiScreen} options={{ title: 'Tentang Aplikasi' }} />
    </Stack.Navigator>
  )
}
import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator, Platform } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import Svg, { Circle, Path } from 'react-native-svg'
import { useAuth } from '../../context/AuthContext'
import { signOut } from '../../services/authService'
import { uploadAvatar } from '../../services/avatarService'
import BottomNavGuru from '../../components/BottomNavGuru'

function ProfileIllustration() {
  return (
    <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8.5} r={3.8} fill="#8FBF93"/>
      <Path d="M4.5 20c0-4 3.4-6.8 7.5-6.8s7.5 2.8 7.5 6.8" fill="#8FBF93"/>
    </Svg>
  )
}

function CameraIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M4 8.5a1 1 0 0 1 1-1h2l1.2-1.8a1 1 0 0 1 .8-.7h6a1 1 0 0 1 .8.7L17 7.5h2a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8.5Z" stroke="#1B5E20" strokeWidth={1.6} strokeLinejoin="round"/>
      <Circle cx={12} cy={13} r={3.2} stroke="#1B5E20" strokeWidth={1.6}/>
    </Svg>
  )
}

function GraduationCapIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path d="M12 4 2 9l10 5 10-5-10-5Z" stroke="#1B5E20" strokeWidth={1.5} strokeLinejoin="round"/>
      <Path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" stroke="#1B5E20" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M21 9v5" stroke="#1B5E20" strokeWidth={1.5} strokeLinecap="round"/>
    </Svg>
  )
}

function PersonIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={3.4} stroke="#1B5E20" strokeWidth={1.6}/>
      <Path d="M5 20c0-3.6 3.1-6.2 7-6.2s7 2.6 7 6.2" stroke="#1B5E20" strokeWidth={1.6} strokeLinecap="round"/>
    </Svg>
  )
}

function ShieldCheckIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3.5 5 6v5.5c0 4.5 3 7.8 7 9 4-1.2 7-4.5 7-9V6l-7-2.5Z" stroke="#1B5E20" strokeWidth={1.6} strokeLinejoin="round"/>
      <Path d="M9.2 12.2l1.9 1.9 3.7-3.9" stroke="#1B5E20" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  )
}

function BellIcon2() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M6 10a6 6 0 1 1 12 0v4l1.5 3h-15L6 14v-4Z" stroke="#1B5E20" strokeWidth={1.6} strokeLinejoin="round"/>
      <Path d="M10 20a2 2 0 0 0 4 0" stroke="#1B5E20" strokeWidth={1.6} strokeLinecap="round"/>
    </Svg>
  )
}

function PaletteIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3.5A8.5 8.5 0 1 0 12 20.5c1.2 0 2-.9 2-2 0-.5-.2-.9-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-1.9 2-1.9h2.3c1.5 0 2.7-1.2 2.7-2.7 0-4.3-4-7.8-9-7.8Z"
        stroke="#1B5E20" strokeWidth={1.5} strokeLinejoin="round"
      />
      <Circle cx={7.5} cy={11} r={1.1} fill="#1B5E20"/>
      <Circle cx={9.5} cy={7.3} r={1.1} fill="#1B5E20"/>
      <Circle cx={14} cy={6.8} r={1.1} fill="#1B5E20"/>
    </Svg>
  )
}

function QuestionCircleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={8.5} stroke="#1B5E20" strokeWidth={1.6}/>
      <Path d="M9.8 9.5a2.2 2.2 0 1 1 3.2 2c-.7.5-1 .9-1 1.8" stroke="#1B5E20" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"/>
      <Circle cx={12} cy={16.6} r={0.9} fill="#1B5E20"/>
    </Svg>
  )
}

function InfoCircleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={8.5} stroke="#1B5E20" strokeWidth={1.6}/>
      <Path d="M12 11v5.3" stroke="#1B5E20" strokeWidth={1.6} strokeLinecap="round"/>
      <Circle cx={12} cy={8} r={0.9} fill="#1B5E20"/>
    </Svg>
  )
}

function LogoutIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M9 4.5H6a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h3" stroke="#E53935" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M14 8l4.5 4-4.5 4" stroke="#E53935" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M18.3 12H9.8" stroke="#E53935" strokeWidth={1.7} strokeLinecap="round"/>
    </Svg>
  )
}

function ChevronRight({ color = '#BFC7C1' }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M9 6l6 6-6 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  )
}

const MENU_ITEMS = [
  { key: 'info', label: 'Informasi Pribadi', Icon: PersonIcon, route: 'InformasiPribadi' },
  { key: 'keamanan', label: 'Keamanan Akun', Icon: ShieldCheckIcon, route: 'KeamananAkun' },
  { key: 'notifikasi', label: 'Notifikasi', Icon: BellIcon2, route: 'NotifikasiSetting' },
  { key: 'preferensi', label: 'Preferensi Tampilan', Icon: PaletteIcon, route: 'PreferensiTampilan' },
  { key: 'bantuan', label: 'Pusat Bantuan', Icon: QuestionCircleIcon, route: 'PusatBantuan' },
  { key: 'tentang', label: 'Tentang Aplikasi', Icon: InfoCircleIcon, route: 'TentangAplikasi' },
]

export default function ProfilScreen({ navigation }) {
  const { profile, refreshProfile, setProfile } = useAuth()
  const [uploading, setUploading] = useState(false)

  async function handlePickAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('Izin Diperlukan', 'Aplikasi butuh akses galeri untuk memilih foto profil.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    })

    if (result.canceled) return

    setUploading(true)
    const { error } = await uploadAvatar(profile.id, result.assets[0].uri)
    setUploading(false)

    if (error) {
      Alert.alert('Gagal Upload Foto', error.message)
    } else {
      await refreshProfile?.()
      Alert.alert('Berhasil', 'Foto profil berhasil diperbarui.')
    }
  }

  function goToMenu(item) {
    navigation.navigate(item.route)
  }

  const [loggingOut, setLoggingOut] = useState(false)

  async function doLogout() {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      const { error } = await signOut()
      if (error) {
        setLoggingOut(false)
        Alert.alert('Gagal Keluar', error.message || 'Terjadi kesalahan saat mencoba keluar.')
        return
      }
      setProfile(null)
    } catch (err) {
      setLoggingOut(false)
      Alert.alert('Gagal Keluar', err?.message || 'Terjadi kesalahan tak terduga.')
    }
  }

  function handleLogout() {
    if (Platform.OS === 'web') {
      // Alert.alert tidak menampilkan dialog apapun di web (react-native-web),
      // jadi gunakan window.confirm sebagai gantinya khusus untuk platform web.
      const confirmed = window.confirm('Yakin ingin keluar dari akun Anda?')
      if (confirmed) doLogout()
      return
    }
    Alert.alert('Keluar', 'Yakin ingin keluar dari akun Anda?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: doLogout },
    ])
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
              ) : (
                <ProfileIllustration />
              )}
              {uploading && (
                <View style={styles.avatarLoadingOverlay}>
                  <ActivityIndicator color="#fff" />
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.cameraBadge} onPress={handlePickAvatar} disabled={uploading}>
              <CameraIcon />
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>{profile?.full_name || 'Guru'}</Text>

          <View style={styles.roleBadge}>
            <GraduationCapIcon />
            <Text style={styles.roleText}>Guru</Text>
          </View>

          <Text style={styles.quote}>
            {profile?.bio || '"Berkomitmen untuk mendidik, menginspirasi,\ndan membimbing generasi terbaik."'}
          </Text>
        </View>

        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, idx) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.menuRow, idx !== MENU_ITEMS.length - 1 && styles.menuRowDivider]}
              onPress={() => goToMenu(item)}
            >
              <View style={styles.menuIconWrap}>
                <item.Icon />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <ChevronRight />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutCard} onPress={handleLogout} disabled={loggingOut}>
          <View style={styles.logoutIconWrap}>
            {loggingOut ? <ActivityIndicator size="small" color="#E53935" /> : <LogoutIcon />}
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.logoutTitle}>{loggingOut ? 'Sedang keluar...' : 'Keluar'}</Text>
            <Text style={styles.logoutDesc}>Keluar dari akun Anda dengan aman</Text>
          </View>
          <ChevronRight color="#E53935" />
        </TouchableOpacity>
      </ScrollView>

      <BottomNavGuru navigation={navigation} active="Profil" />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#F7F8FA' },
  scrollContent: { padding: 18, paddingBottom: 24 },

  profileCard: {
    backgroundColor: '#EAF3EB', borderRadius: 20, alignItems: 'center',
    paddingVertical: 28, paddingHorizontal: 20, marginBottom: 18,
  },
  avatarWrap: { marginBottom: 14 },
  avatarCircle: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: '#E4EFE5',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#fff', overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarLoadingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute', bottom: -2, right: -2, width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#DCE5DD',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2,
  },
  name: { fontSize: 20, fontWeight: '800', color: '#12251A', marginBottom: 8 },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#D9EEDB',
    borderRadius: 20, paddingVertical: 5, paddingHorizontal: 14, marginBottom: 14,
  },
  roleText: { color: '#1B5E20', fontWeight: '700', fontSize: 13 },
  quote: { fontSize: 12.5, color: '#6B776E', textAlign: 'center', lineHeight: 18, fontStyle: 'italic' },

  menuCard: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 18,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 16 },
  menuRowDivider: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  menuIconWrap: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#E4EFE5',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  menuLabel: { flex: 1, fontSize: 14.5, color: '#1B1B1B', fontWeight: '500' },

  logoutCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FDECEC',
    borderWidth: 1, borderColor: '#F5C6C6', borderRadius: 16, padding: 14,
  },
  logoutIconWrap: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FBDADA',
    alignItems: 'center', justifyContent: 'center',
  },
  logoutTitle: { color: '#E53935', fontWeight: '700', fontSize: 14.5, marginBottom: 2 },
  logoutDesc: { color: '#B85A5A', fontSize: 12 },
})
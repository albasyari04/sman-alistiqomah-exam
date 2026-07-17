import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import Svg, { Path, Circle } from 'react-native-svg'
import { useAuth } from '../../context/AuthContext'
import { useSettings } from '../../context/SettingsContext'
import { signOut } from '../../services/authService'
import {
  updateProfileInfo,
  updatePassword,
  updateDarkModeSetting,
} from '../../services/profileService'
import { uploadAvatar } from '../../services/avatarService'
import BottomNavSiswa from '../../components/BottomNavSiswa'

// ---------- Icon set (konsisten dengan DashboardSiswa.js) ----------

function IconCamera({ color = '#fff', size = 16 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 8.5a1 1 0 0 1 1-1h2l1.2-2h7.6l1.2 2h2a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8.5Z" stroke={color} strokeWidth={1.7} strokeLinejoin="round"/>
      <Circle cx={12} cy={12.5} r={3.4} stroke={color} strokeWidth={1.7}/>
    </Svg>
  )
}

function IconPencil({ color = '#1B5E20' }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M15.2 4.8 19.2 8.8 8.4 19.6 4 20l.4-4.4L15.2 4.8Z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round"/>
    </Svg>
  )
}

function IconLock({ color = '#4A4F4C' }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M7 10.5V8a5 5 0 0 1 10 0v2.5" stroke={color} strokeWidth={1.7} strokeLinecap="round"/>
      <Path d="M5.5 10.5h13a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-7.5a1 1 0 0 1 1-1Z" stroke={color} strokeWidth={1.7} strokeLinejoin="round"/>
      <Circle cx={12} cy={15} r={1.6} fill={color}/>
    </Svg>
  )
}

function IconMoon({ color = '#4A4F4C' }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M20 14.2A8.2 8.2 0 1 1 9.8 4a6.4 6.4 0 0 0 10.2 10.2Z" stroke={color} strokeWidth={1.7} strokeLinejoin="round"/>
    </Svg>
  )
}

function IconInfo({ color = '#4A4F4C' }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={8} stroke={color} strokeWidth={1.7}/>
      <Path d="M12 11v5.2" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
      <Circle cx={12} cy={8.3} r={1} fill={color}/>
    </Svg>
  )
}

function IconLogout({ color = '#C0392B' }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M9 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h3" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M15.5 8 20 12l-4.5 4M20 12H9.5" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  )
}

function IconChevronRight({ color = '#B7BBB8' }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M9 5.5 15.5 12 9 18.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  )
}

// ---------- Kartu section reusable ----------

function SectionCard({ icon, title, children }) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionIconWrap}>{icon}</View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  )
}

export default function ProfilSiswa({ navigation }) {
  const { profile, setProfile } = useAuth()
  const { isDark, toggleDarkMode } = useSettings()

  const [avatarError, setAvatarError] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const [editMode, setEditMode] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [savingInfo, setSavingInfo] = useState(false)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  const [darkModeSaving, setDarkModeSaving] = useState(false)

  // ---------- Ganti foto profil ----------
  async function handlePickAvatar() {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!perm.granted) {
        Alert.alert('Izin diperlukan', 'Aktifkan izin akses galeri untuk mengganti foto profil.')
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      })

      if (result.canceled || !result.assets?.[0]?.uri) return

      setAvatarUploading(true)
      setAvatarError(false)
      const { data, error } = await uploadAvatar(profile.id, result.assets[0].uri)
      setAvatarUploading(false)

      if (error) {
        Alert.alert('Gagal', error.message || 'Gagal mengunggah foto profil.')
        return
      }

      setProfile(data)
    } catch (err) {
      setAvatarUploading(false)
      Alert.alert('Gagal', err.message || 'Terjadi kesalahan saat memilih foto.')
    }
  }

  // ---------- Simpan info profil ----------
  async function handleSaveInfo() {
    if (!fullName.trim()) {
      Alert.alert('Nama tidak boleh kosong', 'Mohon isi nama lengkap Anda.')
      return
    }
    setSavingInfo(true)
    const { data, error } = await updateProfileInfo(profile.id, {
      full_name: fullName.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
    })
    setSavingInfo(false)

    if (error) {
      Alert.alert('Gagal', error.message || 'Gagal menyimpan perubahan.')
      return
    }

    setProfile(data)
    setEditMode(false)
    Alert.alert('Berhasil', 'Profil Anda berhasil diperbarui.')
  }

  function handleCancelEdit() {
    setFullName(profile?.full_name || '')
    setPhone(profile?.phone || '')
    setBio(profile?.bio || '')
    setEditMode(false)
  }

  // ---------- Ganti password ----------
  async function handleChangePassword() {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Password terlalu pendek', 'Password baru minimal 6 karakter.')
      return
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Password tidak cocok', 'Konfirmasi password tidak sama dengan password baru.')
      return
    }

    setChangingPassword(true)
    const { error } = await updatePassword(newPassword)
    setChangingPassword(false)

    if (error) {
      Alert.alert('Gagal', error.message || 'Gagal mengganti password.')
      return
    }

    setNewPassword('')
    setConfirmPassword('')
    Alert.alert('Berhasil', 'Password Anda berhasil diganti.')
  }

  // ---------- Mode gelap ----------
  async function handleToggleDarkMode() {
    const nextValue = !isDark
    toggleDarkMode()
    if (profile?.id) {
      setDarkModeSaving(true)
      await updateDarkModeSetting(profile.id, nextValue)
      setDarkModeSaving(false)
    }
  }

  // ---------- Keluar ----------
  function handleLogout() {
    Alert.alert('Keluar', 'Apakah Anda yakin ingin keluar dari akun ini?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: () => signOut() },
    ])
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.headerBar}>
          <Text style={styles.headerBarTitle}>Profil Saya</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ---------- Kartu identitas + foto ---------- */}
          <View style={styles.identityCard}>
            <TouchableOpacity
              style={styles.avatarWrap}
              activeOpacity={0.85}
              onPress={handlePickAvatar}
              disabled={avatarUploading}
            >
              {profile?.avatar_url && !avatarError ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={styles.avatar}
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarInitial}>
                    {(profile?.full_name || 'S').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}

              <View style={styles.avatarCameraBadge}>
                {avatarUploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <IconCamera />
                )}
              </View>
            </TouchableOpacity>

            <Text style={styles.identityName}>{profile?.full_name || 'Siswa'}</Text>
            <Text style={styles.identitySubtitle}>
              {profile?.kelas || 'XII-IPA-1'}{profile?.sekolah ? ` • ${profile.sekolah}` : ' • SMA Al Istiqomah'}
            </Text>
            {!!profile?.email && <Text style={styles.identityEmail}>{profile.email}</Text>}
          </View>

          {/* ---------- Informasi akun ---------- */}
          <SectionCard icon={<IconInfo color="#1B5E20" />} title="Informasi Akun">
            {!editMode ? (
              <>
                <InfoRow label="Nama Lengkap" value={profile?.full_name || '-'} />
                <InfoRow label="No. HP" value={profile?.phone || '-'} />
                <InfoRow label="Bio" value={profile?.bio || '-'} />
                <TouchableOpacity
                  style={styles.editButton}
                  activeOpacity={0.8}
                  onPress={() => setEditMode(true)}
                >
                  <IconPencil color="#1B5E20" />
                  <Text style={styles.editButtonText}>Edit Informasi</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.inputLabel}>Nama Lengkap</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Nama lengkap"
                  placeholderTextColor="#A7ACA8"
                />

                <Text style={styles.inputLabel}>No. HP</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Contoh: 08123456789"
                  placeholderTextColor="#A7ACA8"
                  keyboardType="phone-pad"
                />

                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Ceritakan sedikit tentang dirimu"
                  placeholderTextColor="#A7ACA8"
                  multiline
                  numberOfLines={3}
                />

                <View style={styles.editActionsRow}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonGhost]}
                    activeOpacity={0.8}
                    onPress={handleCancelEdit}
                    disabled={savingInfo}
                  >
                    <Text style={styles.actionButtonGhostText}>Batal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonPrimary]}
                    activeOpacity={0.8}
                    onPress={handleSaveInfo}
                    disabled={savingInfo}
                  >
                    {savingInfo ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.actionButtonPrimaryText}>Simpan</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </SectionCard>

          {/* ---------- Keamanan: ganti password ---------- */}
          <SectionCard icon={<IconLock color="#1B5E20" />} title="Ganti Password">
            <Text style={styles.inputLabel}>Password Baru</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Minimal 6 karakter"
              placeholderTextColor="#A7ACA8"
              secureTextEntry
            />

            <Text style={styles.inputLabel}>Konfirmasi Password Baru</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Ulangi password baru"
              placeholderTextColor="#A7ACA8"
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonPrimary, { marginTop: 4 }]}
              activeOpacity={0.8}
              onPress={handleChangePassword}
              disabled={changingPassword}
            >
              {changingPassword ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.actionButtonPrimaryText}>Ganti Password</Text>
              )}
            </TouchableOpacity>
          </SectionCard>
          
          {/* ---------- Keluar ---------- */}
          <TouchableOpacity style={styles.logoutRow} activeOpacity={0.8} onPress={handleLogout}>
            <IconLogout />
            <Text style={styles.logoutText}>Keluar dari Akun</Text>
            <IconChevronRight color="#C0392B" />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomNavSiswa navigation={navigation} active="Profil" />
    </SafeAreaView>
  )
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
    </View>
  )
}

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 3 },
  elevation: 2,
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7F5' },

  headerBar: {
    backgroundColor: '#F5F7F5',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E9E6',
  },
  headerBarTitle: { fontSize: 20, fontWeight: '700', color: '#1A1D1B' },

  scrollContent: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 32 },

  identityCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 18,
    ...CARD_SHADOW,
  },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  avatarFallback: { backgroundColor: '#1B5E20', alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: '#fff', fontWeight: '700', fontSize: 32 },
  avatarCameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1B5E20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  identityName: { fontSize: 18, fontWeight: '700', color: '#1A1D1B' },
  identitySubtitle: { fontSize: 13, color: '#777', marginTop: 3 },
  identityEmail: { fontSize: 12, color: '#A0A5A1', marginTop: 4 },

  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...CARD_SHADOW,
  },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#E4EFE5', alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { fontSize: 14.5, fontWeight: '700', color: '#1A1D1B' },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F0',
    gap: 12,
  },
  infoLabel: { fontSize: 12.5, color: '#8A8F8B', width: 110 },
  infoValue: { fontSize: 13, color: '#1A1D1B', fontWeight: '600', flex: 1, textAlign: 'right' },

  editButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    marginTop: 14, backgroundColor: '#E4EFE5', paddingVertical: 11, borderRadius: 10,
  },
  editButtonText: { color: '#1B5E20', fontWeight: '700', fontSize: 13 },

  inputLabel: { fontSize: 12, color: '#777', marginBottom: 6, marginTop: 10 },
  input: {
    borderWidth: 1, borderColor: '#E2E5E2', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 13.5, color: '#1A1D1B',
    backgroundColor: '#FBFCFB',
  },
  inputMultiline: { height: 78, textAlignVertical: 'top' },

  editActionsRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  actionButton: { flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actionButtonPrimary: { backgroundColor: '#1B5E20' },
  actionButtonPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  actionButtonGhost: { backgroundColor: '#F0F2F0' },
  actionButtonGhostText: { color: '#4A4F4C', fontWeight: '700', fontSize: 13 },

  prefRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  prefTextWrap: { flex: 1 },
  prefLabel: { fontSize: 13.5, fontWeight: '700', color: '#1A1D1B' },
  prefDesc: { fontSize: 11.5, color: '#8A8F8B', marginTop: 2, lineHeight: 15 },

  logoutRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FDECEA', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16,
    marginTop: 4, marginBottom: 8,
  },
  logoutText: { flex: 1, color: '#C0392B', fontWeight: '700', fontSize: 13.5 },
})
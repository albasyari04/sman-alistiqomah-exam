import { useState } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native'
import { updatePassword } from '../../services/profileService'

export default function KeamananAkunScreen() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleChangePassword() {
    if (newPassword.length < 6) {
      Alert.alert('Perhatian', 'Password baru minimal 6 karakter')
      return
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Perhatian', 'Konfirmasi password tidak cocok')
      return
    }

    setSaving(true)
    const { error } = await updatePassword(newPassword)
    setSaving(false)

    if (error) {
      Alert.alert('Gagal', error.message)
    } else {
      setNewPassword('')
      setConfirmPassword('')
      Alert.alert('Berhasil', 'Password berhasil diperbarui.')
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.sectionTitle}>Ganti Password</Text>
      <Text style={styles.desc}>Gunakan password yang kuat dan tidak dipakai di akun lain.</Text>

      <Text style={styles.label}>Password Baru</Text>
      <TextInput
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Minimal 6 karakter"
        secureTextEntry
      />

      <Text style={styles.label}>Konfirmasi Password Baru</Text>
      <TextInput
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Ulangi password baru"
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleChangePassword} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Perbarui Password</Text>}
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1B1B1B', marginBottom: 4 },
  desc: { fontSize: 12.5, color: '#888', marginBottom: 20, lineHeight: 18 },
  label: { fontWeight: '600', marginTop: 12, marginBottom: 6, color: '#1B1B1B' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 14 },
  button: { backgroundColor: '#1B5E20', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 28 },
  buttonText: { color: '#fff', fontWeight: '700' },
})
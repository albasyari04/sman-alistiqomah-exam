import { useState } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native'
import { useAuth } from '../../context/AuthContext'
import { updateProfileInfo } from '../../services/profileService'

export default function InformasiPribadiScreen() {
  const { profile, refreshProfile } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!fullName.trim()) {
      Alert.alert('Perhatian', 'Nama tidak boleh kosong')
      return
    }
    setSaving(true)
    const { error } = await updateProfileInfo(profile.id, { full_name: fullName, phone, bio })
    setSaving(false)

    if (error) {
      Alert.alert('Gagal Menyimpan', error.message)
    } else {
      await refreshProfile?.()
      Alert.alert('Berhasil', 'Informasi pribadi berhasil diperbarui.')
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.label}>Nama Lengkap</Text>
      <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Nama lengkap" />

      <Text style={styles.label}>Email</Text>
      <TextInput style={[styles.input, styles.inputDisabled]} value={profile?.email || ''} editable={false} />
      <Text style={styles.hint}>Email tidak bisa diubah di sini.</Text>

      <Text style={styles.label}>Nomor Telepon</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="08xxxxxxxxxx" keyboardType="phone-pad" />

      <Text style={styles.label}>Bio Singkat</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={bio}
        onChangeText={setBio}
        placeholder="Tulis motto atau bio singkat..."
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Simpan Perubahan</Text>}
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  label: { fontWeight: '600', marginTop: 14, marginBottom: 6, color: '#1B1B1B' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 14 },
  inputDisabled: { backgroundColor: '#F5F5F5', color: '#999' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  hint: { fontSize: 11.5, color: '#999', marginTop: 4 },
  button: { backgroundColor: '#1B5E20', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 28 },
  buttonText: { color: '#fff', fontWeight: '700' },
})
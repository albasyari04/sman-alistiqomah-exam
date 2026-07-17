import { useState } from 'react'
import { View, Text, StyleSheet, Switch, ActivityIndicator } from 'react-native'
import { useAuth } from '../../context/AuthContext'
import { updateNotificationSettings } from '../../services/profileService'

export default function NotifikasiScreen() {
  const { profile, refreshProfile } = useAuth()
  const [ujianBaru, setUjianBaru] = useState(profile?.notif_ujian_baru ?? true)
  const [pengumuman, setPengumuman] = useState(profile?.notif_pengumuman ?? true)
  const [hasilUjian, setHasilUjian] = useState(profile?.notif_hasil_ujian ?? true)
  const [savingKey, setSavingKey] = useState(null)

  async function handleToggle(key, value, setter) {
    setter(value)
    setSavingKey(key)
    const { error } = await updateNotificationSettings(profile.id, { [key]: value })
    setSavingKey(null)
    if (error) {
      // rollback kalau gagal simpan
      setter(!value)
    } else {
      await refreshProfile?.()
    }
  }

  const items = [
    { key: 'notif_ujian_baru', label: 'Ujian Baru', desc: 'Notifikasi saat ada ujian baru dibuat', value: ujianBaru, setter: setUjianBaru },
    { key: 'notif_pengumuman', label: 'Pengumuman', desc: 'Notifikasi saat ada pengumuman baru', value: pengumuman, setter: setPengumuman },
    { key: 'notif_hasil_ujian', label: 'Hasil Ujian', desc: 'Notifikasi saat siswa menyelesaikan ujian', value: hasilUjian, setter: setHasilUjian },
  ]

  return (
    <View style={styles.container}>
      {items.map((item) => (
        <View key={item.key} style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
          </View>
          {savingKey === item.key ? (
            <ActivityIndicator color="#1B5E20" />
          ) : (
            <Switch
              value={item.value}
              onValueChange={(val) => handleToggle(item.key, val, item.setter)}
              trackColor={{ false: '#ccc', true: '#A5D6A7' }}
              thumbColor={item.value ? '#1B5E20' : '#f4f3f4'}
            />
          )}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  label: { fontSize: 14.5, fontWeight: '600', color: '#1B1B1B', marginBottom: 2 },
  desc: { fontSize: 12, color: '#888' },
})
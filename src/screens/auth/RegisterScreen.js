import { useState } from 'react'
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { signUp } from '../../services/authService'

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [kelas, setKelas] = useState('X-IPA-1')
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    if (!fullName || !email || !password) {
      Alert.alert('Perhatian', 'Semua field wajib diisi')
      return
    }
    setLoading(true)
    const { error } = await signUp(email.trim(), password, fullName, 'siswa', kelas)
    setLoading(false)

    if (error) {
      Alert.alert('Registrasi Gagal', error.message)
    } else {
      Alert.alert('Berhasil', 'Akun berhasil dibuat, silakan login.')
      navigation.navigate('Login')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daftar Akun Siswa</Text>

      <TextInput style={styles.input} placeholder="Nama Lengkap" value={fullName} onChangeText={setFullName} />
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

      <View style={styles.pickerWrapper}>
        <Picker selectedValue={kelas} onValueChange={setKelas}>
          <Picker.Item label="X-IPA-1" value="X-IPA-1" />
          <Picker.Item label="X-IPA-2" value="X-IPA-2" />
          <Picker.Item label="XI-IPA-1" value="XI-IPA-1" />
          <Picker.Item label="XII-IPA-1" value="XII-IPA-1" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Daftar</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Sudah punya akun? Masuk</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 },
  pickerWrapper: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 12 },
  button: { backgroundColor: '#1B5E20', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
  link: { textAlign: 'center', marginTop: 16, color: '#1B5E20' },
})
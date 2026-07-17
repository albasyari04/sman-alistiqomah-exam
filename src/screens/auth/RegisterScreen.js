import { useState } from 'react'
import {
  View, Text, TextInput, StyleSheet, Alert,
  TouchableOpacity, ActivityIndicator, Image, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import Svg, { Path, Circle } from 'react-native-svg'
import { signUp } from '../../services/authService'

function PersonIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={3.6} stroke="#1B5E20" strokeWidth={1.6}/>
      <Path d="M4.5 19.5c1.4-3.4 4.4-5.2 7.5-5.2s6.1 1.8 7.5 5.2" stroke="#1B5E20" strokeWidth={1.6} strokeLinecap="round"/>
    </Svg>
  )
}

function MailIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6.5C3 5.67 3.67 5 4.5 5h15c.83 0 1.5.67 1.5 1.5v11c0 .83-.67 1.5-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11Z" stroke="#1B5E20" strokeWidth={1.6}/>
      <Path d="M4 6.5 12 13l8-6.5" stroke="#1B5E20" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  )
}

function LockIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M6 10.5V8a6 6 0 0 1 12 0v2.5" stroke="#1B5E20" strokeWidth={1.6} strokeLinecap="round"/>
      <Path d="M5.5 10.5h13a1 1 0 0 1 1 1V19a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-7.5a1 1 0 0 1 1-1Z" stroke="#1B5E20" strokeWidth={1.6}/>
      <Circle cx={12} cy={15.5} r={1.4} fill="#1B5E20"/>
    </Svg>
  )
}

function EyeIcon({ open }) {
  return open ? (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" stroke="#8A8A8A" strokeWidth={1.6}/>
      <Circle cx={12} cy={12} r={2.6} stroke="#8A8A8A" strokeWidth={1.6}/>
    </Svg>
  ) : (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M3 3l18 18" stroke="#8A8A8A" strokeWidth={1.6} strokeLinecap="round"/>
      <Path d="M9.9 5.1A10.4 10.4 0 0 1 12 5.5c6.4 0 10 6.5 10 6.5a15.6 15.6 0 0 1-3.2 3.9M6.6 6.6C3.9 8.3 2 12 2 12s3.6 6.5 10 6.5c1.4 0 2.6-.2 3.7-.6" stroke="#8A8A8A" strokeWidth={1.6} strokeLinecap="round"/>
    </Svg>
  )
}

function ClassIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M12 4 3 8.5 12 13l9-4.5L12 4Z" stroke="#1B5E20" strokeWidth={1.6} strokeLinejoin="round"/>
      <Path d="M6.5 10.7V15c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5v-4.3" stroke="#1B5E20" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  )
}

function BottomWave() {
  return (
    <Svg width="100%" height={140} viewBox="0 0 400 140" style={styles.wave} preserveAspectRatio="none">
      <Path d="M0 60 Q100 10 200 55 T400 40 V140 H0 Z" fill="#E9C77B" opacity={0.55}/>
      <Path d="M0 90 Q120 40 240 85 T400 70 V140 H0 Z" fill="#1B5E20"/>
    </Svg>
  )
}

const KELAS_OPTIONS = ['X-IPA-1', 'X-IPA-2', 'XI-IPA-1', 'XII-IPA-1']

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F7F5F0' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />

        <Text style={styles.title}>SMA Al Istiqomah</Text>
        <Text style={styles.subtitle}>Aplikasi Ujian Online</Text>

        <View style={styles.divider} />

        <Text style={styles.welcome}>Buat akun baru!</Text>
        <Text style={styles.welcomeSub}>Daftar untuk mulai mengerjakan ujian online</Text>

        <View style={styles.inputWrapper}>
          <PersonIcon />
          <TextInput
            style={styles.input}
            placeholder="Nama Lengkap"
            placeholderTextColor="#9AA09A"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={styles.inputWrapper}>
          <MailIcon />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#9AA09A"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputWrapper}>
          <LockIcon />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#9AA09A"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={8}>
            <EyeIcon open={showPassword} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <ClassIcon />
          <View style={styles.pickerFlex}>
            <Picker
              selectedValue={kelas}
              onValueChange={setKelas}
              style={styles.picker}
              dropdownIconColor="#1B5E20"
            >
              {KELAS_OPTIONS.map(k => (
                <Picker.Item key={k} label={k} value={k} />
              ))}
            </Picker>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Daftar</Text>}
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Sudah punya akun? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Masuk</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomWave />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  wave: { position: 'absolute', bottom: 0, left: 0 },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 160,
  },
  logo: { width: 110, height: 110, alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', color: '#1B5E20' },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 2 },
  divider: {
    width: 60, height: 2, backgroundColor: '#E9C77B',
    alignSelf: 'center', marginVertical: 18, borderRadius: 2,
  },
  welcome: { fontSize: 16, fontWeight: '700', color: '#1B5E20', textAlign: 'center' },
  welcomeSub: { fontSize: 13, color: '#777', textAlign: 'center', marginBottom: 22 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#E1E1E1', borderRadius: 12,
    paddingHorizontal: 14, marginBottom: 14, backgroundColor: '#fff', height: 52,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 14, color: '#222', outlineStyle: 'none' },
  pickerFlex: { flex: 1, marginLeft: 6 },
  picker: {
    flex: 1,
    color: '#222',
    ...(Platform.OS === 'web' ? { border: 'none', outlineStyle: 'none', backgroundColor: 'transparent' } : {}),
  },
  button: {
    backgroundColor: '#1B5E20', height: 52, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginTop: 6,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 22 },
  footerText: { color: '#555', fontSize: 13 },
  footerLink: { color: '#1B5E20', fontWeight: '700', fontSize: 13 },
})
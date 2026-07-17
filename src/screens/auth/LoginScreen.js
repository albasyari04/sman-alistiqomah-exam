import { useState } from 'react'
import {
  View, Text, TextInput, StyleSheet, Alert,
  TouchableOpacity, ActivityIndicator, Image, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native'
import Svg, { Path, Circle } from 'react-native-svg'
import { signIn } from '../../services/authService'

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

function GoogleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 48 48">
      <Path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
      <Path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.6 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.4 0-13.8 4.1-17.1 10.2z"/>
      <Path fill="#4CAF50" d="M24 44c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5C29.5 34.8 26.9 36 24 36c-5.3 0-9.7-3.1-11.3-7.6l-6.5 5C9.9 39.7 16.4 44 24 44z"/>
      <Path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.5l6.5 5.5C40.9 36.7 44 30.9 44 24c0-1.3-.1-2.7-.4-3.5z"/>
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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Perhatian', 'Email dan password wajib diisi')
      return
    }
    setLoading(true)
    const { error } = await signIn(email.trim(), password)
    setLoading(false)
    if (error) Alert.alert('Login Gagal', error.message)
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

        <Text style={styles.welcome}>Selamat datang kembali!</Text>
        <Text style={styles.welcomeSub}>Masuk untuk melanjutkan ke aplikasi</Text>

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

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Masuk</Text>}
        </TouchableOpacity>

        <View style={styles.orRow}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>atau</Text>
          <View style={styles.orLine} />
        </View>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={() => Alert.alert('Info', 'Login Google belum diaktifkan')}
        >
          <GoogleIcon />
          <Text style={styles.googleText}>Masuk dengan Google</Text>
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Belum punya akun? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}>Daftar</Text>
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
  button: {
    backgroundColor: '#1B5E20', height: 52, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginTop: 6,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  orRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  orLine: { flex: 1, height: 1, backgroundColor: '#E1E1E1' },
  orText: { marginHorizontal: 10, color: '#999', fontSize: 12 },
  googleButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 50, borderRadius: 12, borderWidth: 1, borderColor: '#1B5E20', gap: 10,
  },
  googleText: { color: '#1B5E20', fontWeight: '600', fontSize: 14 },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 22 },
  footerText: { color: '#555', fontSize: 13 },
  footerLink: { color: '#1B5E20', fontWeight: '700', fontSize: 13 },
})
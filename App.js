import 'react-native-gesture-handler'
import { useCallback, useEffect, useState } from 'react'
import { View, Image, StyleSheet, Platform } from 'react-native'
import { enableScreens } from 'react-native-screens'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as SplashScreen from 'expo-splash-screen'
import { AuthProvider } from './src/context/AuthContext'
import { SettingsProvider } from './src/context/SettingsContext'
import RootNavigator from './src/navigation/RootNavigator'

// PENTING: react-native-screens (dipakai oleh @react-navigation/native-stack)
// punya bug lama di web: screen yang aktif bisa ter-render dengan tinggi 0 /
// tidak terlihat sama sekali, walau secara logic React sudah benar (tidak ada
// error, komponen ter-mount). Ini persis gejala yang kita alami: RootNavigator
// sudah render AuthStack (Login), tidak ada error di console, tapi layar
// tetap blank hijau polos.
// Solusinya: matikan optimisasi native-screens KHUSUS di web, supaya
// navigator fallback ke View biasa (bukan native UIViewController/Fragment
// yang di-emulasikan react-native-screens). Native (Android/iOS) tetap pakai
// react-native-screens seperti biasa demi performa, tidak terpengaruh.
if (Platform.OS === 'web') {
  enableScreens(false)
}

// Cegah splash bawaan hilang otomatis sebelum kita siap
try {
  SplashScreen.preventAutoHideAsync().catch(() => {})
} catch (e) {
  console.log('[App] preventAutoHideAsync gagal (diabaikan):', e?.message || e)
}

export default function App() {
  const [appReady, setAppReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function prepare() {
      console.log('[App] prepare() mulai, platform =', Platform.OS)
      try {
        await new Promise((resolve) => setTimeout(resolve, 800))
        console.log('[App] prepare() selesai delay')
      } catch (e) {
        console.log('[App] prepare() error:', e?.message || e)
      } finally {
        if (cancelled) return
        setAppReady(true)
        console.log('[App] appReady = true')

        try {
          await SplashScreen.hideAsync()
          console.log('[App] SplashScreen.hideAsync() sukses')
        } catch (e) {
          console.log('[App] SplashScreen.hideAsync() gagal (diabaikan):', e?.message || e)
        }
      }
    }

    prepare()

    return () => {
      cancelled = true
    }
  }, [])

  const onLayoutRootView = useCallback(() => {
    console.log('[App] onLayoutRootView terpanggil')
  }, [])

  if (!appReady) {
    return (
      // GestureHandlerRootView tetap membungkus splash juga, supaya
      // konsisten dan siap begitu appReady true tanpa remount ekstra.
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.splash}>
          <Image
            source={require('./assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </GestureHandlerRootView>
    )
  }

  return (
    // WAJIB: react-navigation/stack butuh GestureHandlerRootView membungkus
    // seluruh app, kalau tidak, screen di dalam Stack Navigator bisa
    // ke-render dengan height: 0 khususnya di web.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <AuthProvider>
          <SettingsProvider>
            <RootNavigator />
          </SettingsProvider>
        </AuthProvider>
      </View>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#0E3D2B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 220,
    height: 220,
    borderRadius: 44,
  },
})

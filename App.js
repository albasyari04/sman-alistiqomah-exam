import 'react-native-gesture-handler'
import { useCallback, useEffect, useState } from 'react'
import { View, Image, StyleSheet, Platform } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
import { AuthProvider } from './src/context/AuthContext'
import { SettingsProvider } from './src/context/SettingsContext'
import RootNavigator from './src/navigation/RootNavigator'

// Cegah splash bawaan hilang otomatis sebelum kita siap
// (dibungkus try/catch juga, bukan cuma .catch, karena di web pemanggilan
// method native yang belum didukung kadang throw sinkron, bukan promise reject)
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

        // Sembunyikan splash screen LANGSUNG di sini, tidak bergantung
        // pada event onLayout (yang tidak selalu reliable di react-native-web).
        try {
          await SplashScreen.hideAsync()
          console.log('[App] SplashScreen.hideAsync() sukses')
        } catch (e) {
          // Wajar gagal/no-op di web — cukup diabaikan
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
    // Sekarang cuma logging, bukan satu-satunya jalan untuk hide splash.
    console.log('[App] onLayoutRootView terpanggil')
  }, [])

  if (!appReady) {
    return (
      <View style={styles.splash}>
        <Image
          source={require('./assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <AuthProvider>
        <SettingsProvider>
          <RootNavigator />
        </SettingsProvider>
      </AuthProvider>
    </View>
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
import 'react-native-gesture-handler'
import { useCallback, useEffect, useState } from 'react'
import { View, Text, Image, StyleSheet, Platform, ActivityIndicator } from 'react-native'
import { enableScreens } from 'react-native-screens'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as SplashScreen from 'expo-splash-screen'
import { AuthProvider } from './src/context/AuthContext'
import { SettingsProvider } from './src/context/SettingsContext'
import RootNavigator from './src/navigation/RootNavigator'

// Matikan optimisasi react-native-screens khusus di web
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
      if (Platform.OS !== 'web') {
        try {
          await new Promise((resolve) => setTimeout(resolve, 800))
        } catch (e) {
          console.log('[App] prepare() error:', e?.message || e)
        }
      }

      if (cancelled) return
      setAppReady(true)
      try {
        await SplashScreen.hideAsync()
      } catch (e) {
        console.log('[App] SplashScreen.hideAsync() gagal (diabaikan):', e?.message || e)
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
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.splash}>
          <Image
            source={require('./assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.versionBadge}>v1.0.0</Text>
          <ActivityIndicator size="large" color="#ffffff" style={styles.splashIndicator} />
        </View>
      </GestureHandlerRootView>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, minHeight: '100%' }} onLayout={onLayoutRootView}>
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
  versionBadge: {
    marginTop: 16,
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  splashIndicator: {
    marginTop: 22,
  }
})
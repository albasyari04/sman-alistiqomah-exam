import 'react-native-gesture-handler'
import { useCallback, useEffect, useState } from 'react'
import { View, Image, StyleSheet } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
import { AuthProvider } from './src/context/AuthContext'
import { SettingsProvider } from './src/context/SettingsContext'
import RootNavigator from './src/navigation/RootNavigator'

// Cegah splash bawaan hilang otomatis sebelum kita siap
SplashScreen.preventAutoHideAsync().catch(() => {})

export default function App() {
  const [appReady, setAppReady] = useState(false)

  useEffect(() => {
    async function prepare() {
      try {
        // taruh proses loading awal di sini kalau ada (cek sesi login, load font, dll)
        await new Promise((resolve) => setTimeout(resolve, 800))
      } finally {
        setAppReady(true)
      }
    }
    prepare()
  }, [])

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync()
    }
  }, [appReady])

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
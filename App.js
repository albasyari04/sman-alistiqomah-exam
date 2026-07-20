import 'react-native-gesture-handler'
import { useCallback, useEffect, useRef, useState } from 'react'
import { View, Text, Image, StyleSheet, Platform, Animated, Easing } from 'react-native'
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

const APP_VERSION = '1.0.0'
const APP_NAME = 'Ujian Mobile'
const SPLASH_DURATION = 3000 // 3 detik

export default function App() {
  const [appReady, setAppReady] = useState(false)
  const progressAnim = useRef(new Animated.Value(0)).current

  // Progress bar berjalan sekali dari 0% -> 100% selama SPLASH_DURATION,
  // sinkron dengan delay splash di bawah.
  useEffect(() => {
    if (appReady) return

    progressAnim.setValue(0)
    const animation = Animated.timing(progressAnim, {
      toValue: 1,
      duration: SPLASH_DURATION,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    })
    animation.start()

    return () => animation.stop()
  }, [appReady])

  useEffect(() => {
    let cancelled = false

    async function prepare() {
      try {
        await new Promise((resolve) => setTimeout(resolve, SPLASH_DURATION))
      } catch (e) {
        console.log('[App] prepare() error:', e?.message || e)
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
          {/* Badge versi - pojok kanan atas, seperti "V5.7 (70)" di referensi */}
          <View style={styles.topRow}>
            <Text style={styles.versionBadge}>v{APP_VERSION}</Text>
          </View>

          {/* Logo + nama app - tengah layar */}
          <View style={styles.centerContent}>
            <Image
              source={require('./assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>{APP_NAME}</Text>
          </View>

          {/* Teks status + progress bar - bawah layar */}
          <View style={styles.bottomContent}>
            <Text style={styles.loadingText}>Memuat konfigurasi...</Text>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          </View>
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
    paddingVertical: 40,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  topRow: {
    alignItems: 'flex-end',
  },
  versionBadge: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 160,
    height: 160,
    borderRadius: 32,
  },
  appName: {
    marginTop: 20,
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  bottomContent: {
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginBottom: 10,
  },
  progressTrack: {
    width: '80%',
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
})
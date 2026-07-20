import { useEffect, useRef } from 'react'
import { View, Text, Image, StyleSheet, Animated, Easing } from 'react-native'

export default function LoadingScreen({ label = 'Memuat konfigurasi...' }) {
  const progressAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    progressAnim.setValue(0)
    // Jalan ke 90% dalam 3 detik, sisanya nunggu proses asli selesai
    // (mis. induk unmount komponen ini setelah data siap).
    const animation = Animated.timing(progressAnim, {
      toValue: 0.9,
      duration: 3000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    })
    animation.start()
    return () => animation.stop()
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <Image source={require('../../assets/icon.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.appName}>Ujian Mobile</Text>
      </View>

      <View style={styles.bottomContent}>
        <Text style={styles.loadingText}>{label}</Text>
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
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0E3D2B',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 140, height: 140, marginBottom: 18 },
  appName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  bottomContent: {
    width: '100%',
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
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
      <View style={styles.centerContent} pointerEvents="none">
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
    minHeight: '100%',
    backgroundColor: '#0E3D2B',
  },
  centerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 48,
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginBottom: 10,
  },
  progressTrack: {
    width: '100%',
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
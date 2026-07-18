import { View, ActivityIndicator, StyleSheet, Image } from 'react-native'

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/icon.png')} style={styles.logo} resizeMode="contain" />
      <ActivityIndicator size="large" color="#ffffff" style={styles.indicator} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0E3D2B',
  },
  logo: { width: 140, height: 140, marginBottom: 18 },
  indicator: { marginTop: 6 },
})
import { Platform, View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { useAuth } from '../context/AuthContext'
import AuthStack from './AuthStack'
import GuruStack from './GuruStack'
import SiswaStack from './SiswaStack'
import LoadingScreen from '../components/LoadingScreen'
import { useEffect, useState } from 'react'

export default function RootNavigator() {
  const { session, profile, loading } = useAuth()

  console.log('[RootNavigator] render', { loading, hasSession: !!session, hasProfile: !!profile, platform: Platform.OS })

  // Jika loading macet terlalu lama, fallback ke AuthStack supaya user tetap bisa login
  const [fallbackAuth, setFallbackAuth] = useState(false)

  useEffect(() => {
    let t
    if (loading) {
      t = setTimeout(() => {
        console.log('[RootNavigator] loading timeout, falling back to AuthStack')
        setFallbackAuth(true)
      }, 6000)
    } else {
      setFallbackAuth(false)
    }
    return () => clearTimeout(t)
  }, [loading])

  if (loading && !fallbackAuth) {
    return <LoadingScreen />
  }

  return (
    <NavigationContainer>
      <View style={{ flex: 1, minHeight: '100vh' }}>
        {!session || !profile ? (
          <AuthStack />
        ) : profile.role === 'guru' || profile.role === 'admin' ? (
          <GuruStack />
        ) : (
          <SiswaStack />
        )}
      </View>
    </NavigationContainer>
  )
}
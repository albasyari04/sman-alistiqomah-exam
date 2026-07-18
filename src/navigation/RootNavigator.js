import { NavigationContainer } from '@react-navigation/native'
import { useAuth } from '../context/AuthContext'
import AuthStack from './AuthStack'
import GuruStack from './GuruStack'
import SiswaStack from './SiswaStack'
import LoadingScreen from '../components/LoadingScreen'

export default function RootNavigator() {
  const { session, profile, loading } = useAuth()

  console.log('[RootNavigator] render', { loading, hasSession: !!session, hasProfile: !!profile })

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <NavigationContainer>
      {!session || !profile ? (
        <AuthStack />
      ) : profile.role === 'guru' || profile.role === 'admin' ? (
        <GuruStack />
      ) : (
        <SiswaStack />
      )}
    </NavigationContainer>
  )
}
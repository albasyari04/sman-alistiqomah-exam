import { AuthProvider } from './src/context/AuthContext'
import { SettingsProvider } from './src/context/SettingsContext'
import RootNavigator from './src/navigation/RootNavigator'

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <RootNavigator />
      </SettingsProvider>
    </AuthProvider>
  )
}
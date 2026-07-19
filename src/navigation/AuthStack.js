import { Platform } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import LoginScreen from '../screens/auth/LoginScreen'
import RegisterScreen from '../screens/auth/RegisterScreen'

const Stack = Platform.OS === 'web' ? createStackNavigator() : createNativeStackNavigator()

export default function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { flex: 1, minHeight: '100%' },
        cardStyle: { flex: 1, minHeight: '100vh', backgroundColor: '#F7F5F0' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  )
}
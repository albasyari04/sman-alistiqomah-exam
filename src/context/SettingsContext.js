import React, { createContext, useContext, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const SettingsContext = createContext({})

export const SettingsProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false)
  const [language, setLanguage] = useState('id')

  useEffect(() => {
    ;(async () => {
      try {
        const storedDark = await AsyncStorage.getItem('@settings_isDark')
        const storedLang = await AsyncStorage.getItem('@settings_language')
        if (storedDark !== null) setIsDark(storedDark === 'true')
        if (storedLang) setLanguage(storedLang)
      } catch (e) {
        // ignore
      }
    })()
  }, [])

  useEffect(() => {
    AsyncStorage.setItem('@settings_isDark', isDark ? 'true' : 'false')
  }, [isDark])

  useEffect(() => {
    AsyncStorage.setItem('@settings_language', language)
  }, [language])

  const toggleDarkMode = () => setIsDark((v) => !v)

  return (
    <SettingsContext.Provider value={{ isDark, toggleDarkMode, language, setLanguage }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)

export default SettingsContext

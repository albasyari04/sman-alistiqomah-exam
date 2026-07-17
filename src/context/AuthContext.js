import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!error) {
      setProfile(data)
    } else {
      console.log('Gagal ambil profile:', error.message)
    }
    setLoading(false)
  }

  // Dipanggil setelah update profile/avatar/notifikasi/dark-mode dsb,
  // supaya `profile` di context ikut ter-update (bukan cuma tersimpan di DB).
  async function refreshProfile() {
    if (session?.user?.id) {
      await fetchProfile(session.user.id)
    }
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, setProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.log('Gagal ambil session:', error.message)
        }

        if (!mounted) return

        const currentSession = data?.session ?? null
        setSession(currentSession)

        if (currentSession) {
          await fetchProfile(currentSession.user.id)
        } else {
          setLoading(false)
        }
      } catch (err) {
        // Menangkap error jaringan/CORS/dsb supaya app tidak macet di loading
        console.log('Error saat inisialisasi auth:', err?.message || err)
        if (mounted) setLoading(false)
      }
    }

    init()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setSession(session)
      if (session) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!error) {
        setProfile(data)
      } else {
        console.log('Gagal ambil profile:', error.message)
        setProfile(null)
      }
    } catch (err) {
      // Menangkap error jaringan/CORS/RLS dsb supaya loading tidak macet selamanya
      console.log('Error tak terduga saat ambil profile:', err?.message || err)
      setProfile(null)
    } finally {
      setLoading(false)
    }
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
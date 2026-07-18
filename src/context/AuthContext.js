import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    let initTimeout = null

    async function init() {
      console.log('[Auth] init started')
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.log('[Auth] getSession error:', error.message || error)
        }

        if (!mounted) return

        const currentSession = data?.session ?? null
        console.log('[Auth] currentSession:', !!currentSession)
        setSession(currentSession)

        if (currentSession) {
          await fetchProfile(currentSession.user.id)
        } else {
          setLoading(false)
        }
      } catch (err) {
        // Menangkap error jaringan/CORS/dsb supaya app tidak macet di loading
        console.log('[Auth] Error saat inisialisasi auth:', err?.message || err)
        if (mounted) setLoading(false)
      }
    }

    init()

    // safety: jika setelah beberapa detik masih loading, hentikan agar UI tidak macet
    initTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.log('[Auth] init timeout, forcing loading=false')
        setLoading(false)
      }
    }, 8000)

    const listener = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] onAuthStateChange', event, !!session)
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
      if (initTimeout) clearTimeout(initTimeout)
      try {
        // unsubscribe safely depending on returned shape
        if (listener && listener.data && listener.data.subscription && typeof listener.data.subscription.unsubscribe === 'function') {
          listener.data.subscription.unsubscribe()
        } else if (listener && typeof listener.unsubscribe === 'function') {
          listener.unsubscribe()
        }
      } catch (e) {
        console.log('[Auth] unsubscribe failed', e?.message || e)
      }
    }
  }, [])

  async function fetchProfile(userId) {
    console.log('[Auth] fetchProfile start', userId)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!error && data) {
        setProfile(data)
        console.log('[Auth] profile fetched', data?.id, data?.role)
      } else {
        console.log('[Auth] Gagal ambil profile:', error?.message || error, '— mencoba buat profile default')
        // Jika profile belum ada, coba buat profile minimal agar app dapat melanjutkan
        try {
          const upsertPayload = { id: userId, full_name: '', role: 'siswa' }
          const { data: upserted, error: upsertErr } = await supabase.from('profiles').upsert(upsertPayload).select().single()
          if (!upsertErr && upserted) {
            setProfile(upserted)
            console.log('[Auth] profile dibuat otomatis', upserted?.id)
          } else {
            console.log('[Auth] gagal upsert profile:', upsertErr || 'unknown')
            setProfile(null)
          }
        } catch (e) {
          console.log('[Auth] error saat upsert profile:', e?.message || e)
          setProfile(null)
        }
      }
    } catch (err) {
      // Menangkap error jaringan/CORS/RLS dsb supaya loading tidak macet selamanya
      console.log('[Auth] Error tak terduga saat ambil profile:', err?.message || err)
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
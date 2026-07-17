import { supabase } from '../lib/supabase'

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signUp(email, password, fullName, role = 'siswa', kelas = '') {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })

  if (error) return { data, error }

  if (data.user) {
    await supabase.from('profiles').update({ role, kelas }).eq('id', data.user.id)
  }

  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}
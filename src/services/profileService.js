import { supabase } from '../lib/supabase'

// Ambil semua user yang BUKAN guru (siswa/peserta ujian)
export async function getAllPeserta() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, kelas')
    .neq('role', 'guru')
    .order('kelas', { ascending: true })
    .order('full_name', { ascending: true })

  return { data, error }
}

export async function updateProfileInfo(userId, { full_name, phone, bio }) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ full_name, phone, bio })
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
}

export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword })
  return { data, error }
}

export async function updateNotificationSettings(userId, settings) {
  const { data, error } = await supabase
    .from('profiles')
    .update(settings)
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
}

export async function updateDarkModeSetting(userId, darkMode) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ dark_mode: darkMode })
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
}
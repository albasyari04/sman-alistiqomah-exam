import { supabase } from '../lib/supabase'

// ===================== GURU =====================

// Semua pengumuman milik guru yang login (untuk daftar kelola)
export async function getMyPengumuman(userId) {
  const { data, error } = await supabase
    .from('pengumuman')
    .select('*')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function createPengumuman(userId, payload) {
  const { data, error } = await supabase
    .from('pengumuman')
    .insert({
      title: payload.title,
      content: payload.content,
      category: payload.category || 'umum',
      target_kelas: payload.targetKelas && payload.targetKelas.length > 0 ? payload.targetKelas : null,
      created_by: userId,
    })
    .select()
    .single()
  return { data, error }
}

export async function updatePengumuman(id, payload) {
  const { data, error } = await supabase
    .from('pengumuman')
    .update({
      title: payload.title,
      content: payload.content,
      category: payload.category || 'umum',
      target_kelas: payload.targetKelas && payload.targetKelas.length > 0 ? payload.targetKelas : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export async function deletePengumuman(id) {
  const { error } = await supabase.from('pengumuman').delete().eq('id', id)
  return { error }
}

// Daftar kelas unik dari tabel profiles, untuk pilihan chip target kelas
export async function getDistinctKelas() {
  const { data, error } = await supabase.from('profiles').select('kelas').eq('role', 'siswa')
  if (error) return { data: [], error }
  const unique = [...new Set((data || []).map((r) => r.kelas).filter(Boolean))].sort()
  return { data: unique, error: null }
}

// ===================== SISWA =====================

// RLS di tabel sudah otomatis memfilter berdasarkan kelas siswa yang login,
// jadi query di sini cukup ambil semua baris yang lolos policy.
export async function getPengumumanForStudent() {
  const { data, error } = await supabase
    .from('pengumuman')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}
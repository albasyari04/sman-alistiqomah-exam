import { supabase } from '../lib/supabase'

// Ambil semua pengumuman milik guru tertentu (terbaru dulu)
export async function getAnnouncementsByGuru(userId) {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })
  return { data, error }
}

// Buat pengumuman baru
export async function createAnnouncement(userId, { title, content, target_kelas, is_active = true }) {
  const { data, error } = await supabase
    .from('announcements')
    .insert({
      title,
      content,
      target_kelas: target_kelas || null,
      is_active,
      created_by: userId,
    })
    .select()
    .single()
  return { data, error }
}

// Edit pengumuman
export async function updateAnnouncement(id, { title, content, target_kelas, is_active }) {
  const { data, error } = await supabase
    .from('announcements')
    .update({ title, content, target_kelas: target_kelas || null, is_active })
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

// Aktifkan / nonaktifkan pengumuman dengan cepat (tanpa buka form edit)
export async function toggleAnnouncementActive(id, isActive) {
  const { data, error } = await supabase
    .from('announcements')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

// Hapus pengumuman
export async function deleteAnnouncement(id) {
  const { error } = await supabase.from('announcements').delete().eq('id', id)
  return { error }
}

// Untuk sisi siswa nanti: ambil pengumuman aktif yang berlaku untuk kelasnya
// (target_kelas null = berlaku untuk semua kelas)
export async function getActiveAnnouncementsForKelas(kelas) {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .or(`target_kelas.is.null,target_kelas.eq.${kelas}`)
    .order('created_at', { ascending: false })
  return { data, error }
}
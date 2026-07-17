import { supabase } from '../lib/supabase'

export async function getResultsByExam(examId) {
  const { data, error } = await supabase
    .from('results')
    .select('*, profiles:student_id(full_name, kelas)')
    .eq('exam_id', examId)
    .order('score', { ascending: false })
  return { data, error }
}
export async function getMyResult(examId, studentId) {
  const { data, error } = await supabase
    .from('results')
    .select('*')
    .eq('exam_id', examId)
    .eq('student_id', studentId)
    .maybeSingle()
  return { data, error }
}

export async function submitExam(examId, studentId) {
  // Ambil semua jawaban siswa untuk ujian ini
  const { data: answers, error: answersError } = await supabase
    .from('student_answers')
    .select('question_id, selected_option')
    .eq('exam_id', examId)
    .eq('student_id', studentId)

  if (answersError) return { error: answersError }

  // Ambil kunci jawaban asli (guru saja yang boleh akses tabel questions langsung,
  // tapi untuk hitung skor kita perlu bandingkan lewat RPC/Edge Function idealnya.
  // Untuk versi sederhana ini, kita ambil dari tabel questions karena RLS
  // mengizinkan authenticated read; is_correct sudah dihitung saat menjawab.)
  const { data: studentAnswers } = await supabase
    .from('student_answers')
    .select('is_correct')
    .eq('exam_id', examId)
    .eq('student_id', studentId)

  const totalSoal = studentAnswers.length
  const totalBenar = studentAnswers.filter((a) => a.is_correct).length
  const score = totalSoal > 0 ? Math.round((totalBenar / totalSoal) * 100) : 0

  const { data, error } = await supabase
    .from('results')
    .upsert(
      { exam_id: examId, student_id: studentId, score, submitted_at: new Date().toISOString() },
      { onConflict: 'exam_id,student_id' }
    )
    .select()
    .single()

  return { data, error }
}

// Semua hasil ujian milik satu siswa, lengkap dengan info ujiannya (join ke exams).
// Dipakai untuk dashboard siswa: total selesai, rata-rata nilai, nilai terbaru.
export async function getResultsByStudent(studentId) {
  const { data, error } = await supabase
    .from('results')
    .select('*, exams:exam_id(title, subject, start_time, end_time)')
    .eq('student_id', studentId)
    .order('submitted_at', { ascending: false })
  return { data, error }
}

// Statistik dashboard guru: total ujian dibuat, total peserta unik,
// jumlah pengerjaan yang sudah dikumpulkan, dan rata-rata nilai
export async function getStatsByGuru(userId) {
  // 1. Ambil semua ujian milik guru ini
  const { data: exams, error: examError } = await supabase
    .from('exams')
    .select('id')
    .eq('created_by', userId)

  if (examError) return { data: null, error: examError }

  const examIds = (exams || []).map((e) => e.id)
  const totalUjianDibuat = examIds.length

  if (examIds.length === 0) {
    return {
      data: { totalUjianDibuat: 0, totalPeserta: 0, ujianSelesai: 0, rataRataNilai: 0 },
      error: null,
    }
  }

  // 2. Ambil semua hasil (results) yang masuk untuk ujian-ujian tersebut
  const { data: results, error: resultError } = await supabase
    .from('results')
    .select('student_id, score')
    .in('exam_id', examIds)

  if (resultError) return { data: null, error: resultError }

  const ujianSelesai = results.length
  const totalPeserta = new Set(results.map((r) => r.student_id)).size
  const rataRataNilai =
    ujianSelesai > 0
      ? Math.round(results.reduce((sum, r) => sum + (r.score || 0), 0) / ujianSelesai)
      : 0

  return {
    data: { totalUjianDibuat, totalPeserta, ujianSelesai, rataRataNilai },
    error: null,
  }
}
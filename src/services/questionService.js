import { supabase } from '../lib/supabase'

export async function addQuestion(examId, question, orderNumber) {
  const { data, error } = await supabase.from('questions').insert({
    exam_id: examId,
    question_text: question.text,
    option_a: question.a,
    option_b: question.b,
    option_c: question.c,
    option_d: question.d,
    option_e: question.e || null,
    correct_option: question.correct,
    order_number: orderNumber,
    question_type: question.type || 'pilihan_ganda',
    image_url: question.imageUrl || null,
  })
  return { data, error }
}

export async function addQuestionsBulk(examId, questionsArray) {
  const rows = questionsArray.map((q, idx) => ({
    exam_id: examId,
    question_text: q.text,
    option_a: q.a,
    option_b: q.b,
    option_c: q.c,
    option_d: q.d,
    option_e: q.e || null,
    correct_option: q.correct,
    order_number: idx + 1,
  }))
  const { data, error } = await supabase.from('questions').insert(rows)
  return { data, error }
}

export async function getQuestionsByExam(examId) {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('exam_id', examId)
    .order('order_number', { ascending: true })
  return { data, error }
}

export async function getQuestionsForStudent(examId) {
  const { data, error } = await supabase
    .from('questions_for_student')
    .select('*')
    .eq('exam_id', examId)
    .order('order_number', { ascending: true })
  return { data, error }
}

export async function saveStudentAnswer(examId, questionId, selectedOption) {
  const { data, error } = await supabase.rpc('submit_answer', {
    p_exam_id: examId,
    p_question_id: questionId,
    p_selected_option: selectedOption,
  })
  return { data, error }
}

export async function getMyAnswers(examId, studentId) {
  const { data, error } = await supabase
    .from('student_answers')
    .select('question_id, selected_option')
    .eq('exam_id', examId)
    .eq('student_id', studentId)
  return { data, error }
}

// ===================== BANK SOAL =====================

// Ambil semua soal dari semua ujian milik guru ini, lengkap dengan
// info mata pelajaran & kelas dari ujian terkait (untuk filter di Bank Soal)
export async function getAllQuestionsByGuru(userId) {
  const { data, error } = await supabase
    .from('questions')
    .select('*, exams:exam_id!inner(subject, kelas, title, created_by)')
    .eq('exams.created_by', userId)
    .order('order_number', { ascending: true })
  return { data, error }
}

export async function updateQuestion(questionId, updates) {
  const { data, error } = await supabase
    .from('questions')
    .update(updates)
    .eq('id', questionId)
    .select()
    .single()
  return { data, error }
}

export async function deleteQuestion(questionId) {
  const { error } = await supabase.from('questions').delete().eq('id', questionId)
  return { error }
}

// Cek soal mana saja yang sudah pernah dikerjakan siswa (buat stat "Digunakan")
export async function getUsedQuestionIds(examIds) {
  if (!examIds || examIds.length === 0) return { data: [], error: null }
  const { data, error } = await supabase
    .from('student_answers')
    .select('question_id')
    .in('exam_id', examIds)
  return { data, error }
}

// Upload gambar soal ke Supabase Storage, kembalikan public URL-nya
export async function uploadQuestionImage(fileUri, userId) {
  try {
    const fileExt = (fileUri.split('.').pop() || 'jpg').split('?')[0]
    const fileName = `${userId}-${Date.now()}.${fileExt}`

    const response = await fetch(fileUri)
    const blob = await response.blob()

    const { error: uploadError } = await supabase.storage
      .from('question-images')
      .upload(fileName, blob, {
        contentType: blob.type || 'image/jpeg',
        upsert: true,
      })

    if (uploadError) return { url: null, error: uploadError }

    const { data } = supabase.storage.from('question-images').getPublicUrl(fileName)
    return { url: data.publicUrl, error: null }
  } catch (err) {
    return { url: null, error: err }
  }
}
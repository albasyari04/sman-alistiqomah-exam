import { supabase } from '../lib/supabase'

export async function createExam(examData, userId) {
  const { data, error } = await supabase
    .from('exams')
    .insert({
      title: examData.title,
      subject: examData.subject,
      created_by: userId,
      start_time: examData.startTime,
      end_time: examData.endTime,
      duration_minutes: examData.duration,
    })
    .select()
    .single()
  return { data, error }
}

export async function getExamsByGuru(userId) {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function getAllActiveExams() {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .order('start_time', { ascending: true })
  return { data, error }
}
export async function getExamById(examId) {
  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .eq('id', examId)
    .single()
  return { data, error }
}
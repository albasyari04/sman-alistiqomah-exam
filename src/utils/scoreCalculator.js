export function calculateScore(totalBenar, totalSoal) {
  if (totalSoal === 0) return 0
  return Math.round((totalBenar / totalSoal) * 100)
}

export function getScoreCategory(score) {
  if (score >= 90) return { label: 'Sangat Baik', color: '#1B5E20' }
  if (score >= 75) return { label: 'Baik', color: '#2e7d32' }
  if (score >= 60) return { label: 'Cukup', color: '#f39c12' }
  return { label: 'Perlu Belajar Lagi', color: '#c0392b' }
}

export function countAnsweredQuestions(answers) {
  return Object.keys(answers).length
}

export function countUnansweredQuestions(totalQuestions, answers) {
  return totalQuestions - Object.keys(answers).length
}
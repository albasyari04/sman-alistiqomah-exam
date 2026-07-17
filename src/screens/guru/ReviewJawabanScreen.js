import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { addQuestionsBulk } from '../../services/questionService'

const LETTERS = ['a', 'b', 'c', 'd', 'e']

export default function ReviewJawabanScreen({ route, navigation }) {
  const { examId, questions: initialQuestions } = route.params
  const [questions, setQuestions] = useState(initialQuestions)
  const [saving, setSaving] = useState(false)
  const insets = useSafeAreaInsets()

  function updateField(qIndex, field, value) {
    setQuestions((prev) => {
      const copy = [...prev]
      copy[qIndex] = { ...copy[qIndex], [field]: value }
      if (LETTERS.includes(field) && value.trim() === '' && copy[qIndex].correct === field) {
        copy[qIndex].correct = null
      }
      return copy
    })
  }

  function setCorrect(qIndex, letter) {
    setQuestions((prev) => {
      const copy = [...prev]
      // Ketuk lagi huruf yang sama untuk membatalkan pilihan (jadi opsional)
      copy[qIndex] = { ...copy[qIndex], correct: copy[qIndex].correct === letter ? null : letter }
      return copy
    })
  }

  // Syarat WAJIB untuk bisa disimpan: teks soal + minimal 2 pilihan jawaban.
  // Kunci jawaban TIDAK wajib.
  function isQuestionValid(q) {
    const filledOptions = LETTERS.filter((l) => q[l] && q[l].trim() !== '')
    return q.text.trim() !== '' && filledOptions.length >= 2
  }

  function hasAnswerKey(q) {
    return !!q.correct && q[q.correct]?.trim() !== ''
  }

  async function handleSaveAll() {
    const belumValid = questions.filter((q) => !isQuestionValid(q))
    if (belumValid.length > 0) {
      Alert.alert(
        'Perhatian',
        `Masih ada ${belumValid.length} soal yang belum lengkap. Pastikan setiap soal punya teks pertanyaan dan minimal 2 pilihan jawaban. Kunci jawaban boleh dikosongkan dulu.`
      )
      return
    }

    const belumAdaKunci = questions.filter((q) => !hasAnswerKey(q)).length

    const proceed = async () => {
      setSaving(true)
      const { error } = await addQuestionsBulk(examId, questions)
      setSaving(false)

      if (error) {
        Alert.alert('Gagal Menyimpan', error.message)
      } else {
        Alert.alert('Berhasil', `${questions.length} soal berhasil disimpan.`)
        navigation.navigate('DaftarUjianGuru')
      }
    }

    if (belumAdaKunci > 0) {
      Alert.alert(
        'Kunci Jawaban Belum Lengkap',
        `${belumAdaKunci} soal belum ditandai kunci jawabannya. Soal tetap bisa disimpan dan kunci jawaban bisa dilengkapi nanti. Lanjut simpan?`,
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Simpan Sekarang', onPress: proceed },
        ]
      )
      return
    }

    proceed()
  }

  const validCount = questions.filter(isQuestionValid).length
  const answeredCount = questions.filter(hasAnswerKey).length

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Soal Siap Disimpan: {validCount}/{questions.length}
      </Text>
      <Text style={styles.subheader}>
        Kunci jawaban: {answeredCount}/{questions.length} sudah ditandai (opsional, bisa dilengkapi nanti)
      </Text>

      <ScrollView style={{ flex: 1 }}>
        {questions.map((q, qIndex) => (
          <View key={qIndex} style={styles.card}>
            <Text style={styles.cardNumber}>Soal {qIndex + 1}</Text>

            <TextInput
              style={[styles.input, styles.questionInput]}
              value={q.text}
              onChangeText={(val) => updateField(qIndex, 'text', val)}
              multiline
              placeholder="Tulis pertanyaan..."
            />

            {LETTERS.map((letter) => {
              const optionText = q[letter] || ''
              const isSelected = q.correct === letter
              const isFilled = optionText.trim() !== ''
              return (
                <View key={letter} style={styles.optionRow}>
                  <TouchableOpacity
                    style={[
                      styles.letterBadge,
                      isSelected && styles.letterBadgeSelected,
                      !isFilled && styles.letterBadgeDisabled,
                    ]}
                    disabled={!isFilled}
                    onPress={() => setCorrect(qIndex, letter)}
                  >
                    <Text style={[styles.letterText, isSelected && styles.letterTextSelected]}>
                      {letter.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.input, styles.optionInput, isSelected && styles.optionInputSelected]}
                    value={optionText}
                    onChangeText={(val) => updateField(qIndex, letter, val)}
                    placeholder={`Pilihan ${letter.toUpperCase()}${letter === 'e' ? ' (opsional)' : ''}`}
                  />
                </View>
              )
            })}

            {!isQuestionValid(q) ? (
              <Text style={styles.errorText}>
                Wajib diisi: teks soal dan minimal 2 pilihan jawaban.
              </Text>
            ) : !hasAnswerKey(q) ? (
              <Text style={styles.hintText}>
                Kunci jawaban belum ditandai (opsional — ketuk salah satu huruf di atas kalau sudah yakin).
              </Text>
            ) : null}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.saveButton, { marginBottom: insets.bottom > 0 ? insets.bottom : 12 }]}
        onPress={handleSaveAll}
        disabled={saving}
      >
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Simpan Semua Soal</Text>}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { fontSize: 16, fontWeight: '700', marginBottom: 2, color: '#1B5E20' },
  subheader: { fontSize: 12, color: '#888', marginBottom: 12 },
  card: { borderWidth: 1, borderColor: '#eee', borderRadius: 10, padding: 12, marginBottom: 14 },
  cardNumber: { fontWeight: '700', color: '#1B5E20', marginBottom: 8, fontSize: 13 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 14 },
  questionInput: { minHeight: 60, marginBottom: 10 },
  optionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  optionInput: { flex: 1 },
  optionInputSelected: { borderColor: '#1B5E20', backgroundColor: '#E8F5E9' },
  letterBadge: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 1.4, borderColor: '#1B5E20',
    alignItems: 'center', justifyContent: 'center',
  },
  letterBadgeSelected: { backgroundColor: '#1B5E20' },
  letterBadgeDisabled: { borderColor: '#ccc' },
  letterText: { fontWeight: '700', color: '#1B5E20' },
  letterTextSelected: { color: '#fff' },
  errorText: { color: '#c0392b', fontSize: 12, marginTop: 4 },
  hintText: { color: '#E67E22', fontSize: 12, marginTop: 4 },
  saveButton: { backgroundColor: '#1B5E20', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  saveButtonText: { color: '#fff', fontWeight: '700' },
})
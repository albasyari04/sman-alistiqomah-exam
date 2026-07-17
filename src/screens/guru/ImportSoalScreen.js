import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { useState } from 'react'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system/legacy'
import Papa from 'papaparse'
import { addQuestionsBulk } from '../../services/questionService'
import { parseDocxToQuestions } from '../../services/docxImportService'

export default function ImportSoalScreen({ route, navigation }) {
  const { examId } = route.params
  const [loading, setLoading] = useState(false)

  async function pickAndImportCsv() {
    const result = await DocumentPicker.getDocumentAsync({ type: 'text/csv' })
    if (result.canceled) return

    const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri)

    Papa.parse(fileContent, {
      header: true,
      complete: async (parsed) => {
        const questions = parsed.data
          .filter((row) => row.question)
          .map((row) => ({
            text: row.question,
            a: row.option_a,
            b: row.option_b,
            c: row.option_c,
            d: row.option_d,
            e: row.option_e || '',
            correct: row.correct?.toLowerCase(),
          }))

        const { error } = await addQuestionsBulk(examId, questions)
        if (error) {
          Alert.alert('Gagal Import', error.message)
        } else {
          Alert.alert('Berhasil', `${questions.length} soal berhasil diimport`)
          navigation.navigate('DaftarUjianGuru')
        }
      },
    })
  }

  async function pickAndImportDocx() {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
    if (result.canceled) return

    setLoading(true)
    try {
      const questions = await parseDocxToQuestions(result.assets[0].uri)
      setLoading(false)

      if (questions.length === 0) {
        Alert.alert(
          'Tidak Ditemukan Soal',
          'Setiap soal perlu diawali angka (contoh: "1."). Pilihan jawaban (a. b. c. ...) boleh dikosongkan dulu, nanti bisa dilengkapi di layar berikutnya.'
        )
        return
      }

      navigation.navigate('ReviewJawaban', { examId, questions })
    } catch (err) {
      setLoading(false)
      Alert.alert('Gagal Membaca File', err.message)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.desc}>
        Format CSV: question, option_a, option_b, option_c, option_d, option_e (opsional), correct
      </Text>
      <TouchableOpacity style={styles.button} onPress={pickAndImportCsv}>
        <Text style={styles.buttonText}>Pilih File CSV</Text>
      </TouchableOpacity>

      <View style={{ height: 16 }} />

      <Text style={styles.desc}>
        Import dari Word (.docx): setiap soal diawali angka (contoh "1."). Pilihan jawaban A-E boleh belum ada di file — bisa dilengkapi manual di layar berikutnya.
      </Text>
      <TouchableOpacity style={[styles.button, styles.docxButton]} onPress={pickAndImportDocx} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Pilih File Word (.docx)</Text>}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 24 },
  desc: { color: '#666', marginBottom: 12 },
  button: { backgroundColor: '#1B5E20', padding: 14, borderRadius: 8, alignItems: 'center' },
  docxButton: { backgroundColor: '#2B579A' },
  buttonText: { color: '#fff', fontWeight: '600' },
})
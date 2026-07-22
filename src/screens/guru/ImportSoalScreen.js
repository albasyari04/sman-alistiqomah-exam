import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native'
import { useState } from 'react'
import * as DocumentPicker from 'expo-document-picker'
import Papa from 'papaparse'
import { addQuestionsBulk } from '../../services/questionService'
import { parseDocxToQuestions } from '../../services/docxImportService'
import { showAlert } from '../../utils/crossAlert'

// FileSystem (expo-file-system) TIDAK didukung di platform web ("is not available on web").
// Import lazy hanya dipakai kalau bukan web, supaya tidak error saat bundling/berjalan di web.
let FileSystem = null
if (Platform.OS !== 'web') {
  FileSystem = require('expo-file-system/legacy')
}

// Baca isi file sebagai TEKS biasa (untuk CSV), platform-aware.
async function readAssetAsText(asset) {
  if (Platform.OS === 'web') {
    // Di web, expo-document-picker menyertakan `file` (browser File/Blob) di setiap asset.
    if (!asset.file) throw new Error('Tidak bisa membaca file di browser ini.')
    return await asset.file.text()
  }
  return await FileSystem.readAsStringAsync(asset.uri)
}

// Baca isi file sebagai BASE64 (untuk DOCX), platform-aware.
async function readAssetAsBase64(asset) {
  if (Platform.OS === 'web') {
    if (!asset.file) throw new Error('Tidak bisa membaca file di browser ini.')
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        // reader.result berformat "data:<mime>;base64,<DATA>"
        const result = reader.result || ''
        const base64 = result.includes(',') ? result.split(',')[1] : result
        resolve(base64)
      }
      reader.onerror = () => reject(new Error('Gagal membaca file di browser.'))
      reader.readAsDataURL(asset.file)
    })
  }
  return await FileSystem.readAsStringAsync(asset.uri, {
    encoding: FileSystem.EncodingType.Base64,
  })
}

export default function ImportSoalScreen({ route, navigation }) {
  const { examId } = route.params
  const [loading, setLoading] = useState(false)

  async function pickAndImportCsv() {
    const result = await DocumentPicker.getDocumentAsync({ type: 'text/csv' })
    if (result.canceled) return

    setLoading(true)
    try {
      const fileContent = await readAssetAsText(result.assets[0])

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

          try {
            const { error } = await addQuestionsBulk(examId, questions)
            setLoading(false)
            if (error) {
              showAlert('Gagal Import', error.message)
            } else {
              showAlert('Berhasil', `${questions.length} soal berhasil diimport`, [
                { text: 'OK', onPress: () => navigation.navigate('DaftarUjianGuru') },
              ])
            }
          } catch (err) {
            setLoading(false)
            showAlert('Gagal Import', err.message || 'Terjadi kesalahan tak terduga.')
          }
        },
        error: (err) => {
          setLoading(false)
          showAlert('Gagal Membaca CSV', err.message)
        },
      })
    } catch (err) {
      setLoading(false)
      showAlert('Gagal Membaca File', err.message)
    }
  }

  async function pickAndImportDocx() {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
    if (result.canceled) return

    setLoading(true)
    try {
      const base64 = await readAssetAsBase64(result.assets[0])
      const questions = await parseDocxToQuestions(base64)
      setLoading(false)

      if (questions.length === 0) {
        showAlert(
          'Tidak Ditemukan Soal',
          'Setiap soal perlu diawali angka (contoh: "1."), atau memakai fitur Numbering bawaan Word. Pilihan jawaban (a. b. c. ...) boleh dikosongkan dulu, nanti bisa dilengkapi di layar berikutnya.'
        )
        return
      }

      navigation.navigate('ReviewJawaban', { examId, questions })
    } catch (err) {
      setLoading(false)
      showAlert('Gagal Membaca File', err.message)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.desc}>
        Format CSV: question, option_a, option_b, option_c, option_d, option_e (opsional), correct
      </Text>
      <TouchableOpacity style={styles.button} onPress={pickAndImportCsv} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Pilih File CSV</Text>}
      </TouchableOpacity>

      <View style={{ height: 16 }} />

      <Text style={styles.desc}>
        Import dari Word (.docx): setiap soal diawali angka (contoh "1.") atau memakai Numbering Word. Pilihan jawaban A-E boleh belum ada di file — bisa dilengkapi manual di layar berikutnya.
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
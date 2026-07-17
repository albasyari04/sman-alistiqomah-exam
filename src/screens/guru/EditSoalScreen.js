import { useState } from 'react'
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Image, ActivityIndicator, ScrollView } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useAuth } from '../../context/AuthContext'
import { updateQuestion, uploadQuestionImage } from '../../services/questionService'

export default function EditSoalScreen({ route, navigation }) {
  const { question } = route.params
  const { session } = useAuth()

  const [questionType, setQuestionType] = useState(question.question_type || 'pilihan_ganda')
  const [questionText, setQuestionText] = useState(question.question_text || '')
  const [optionA, setOptionA] = useState(question.option_a || '')
  const [optionB, setOptionB] = useState(question.option_b || '')
  const [optionC, setOptionC] = useState(question.option_c || '')
  const [optionD, setOptionD] = useState(question.option_d || '')
  const [optionE, setOptionE] = useState(question.option_e || '')
  const [correct, setCorrect] = useState(question.correct_option || 'a')
  const [imageUri, setImageUri] = useState(question.image_url || null)
  const [imageChanged, setImageChanged] = useState(false)
  const [saving, setSaving] = useState(false)

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('Izin Diperlukan', 'Aplikasi butuh akses galeri untuk memilih gambar soal.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType ? ['images'] : ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    })
    if (!result.canceled) {
      setImageUri(result.assets[0].uri)
      setImageChanged(true)
    }
  }

  function removeImage() {
    setImageUri(null)
    setImageChanged(true)
  }

  async function handleSave() {
    if (!questionText) {
      Alert.alert('Perhatian', 'Pertanyaan wajib diisi')
      return
    }
    if (questionType === 'pilihan_ganda' && (!optionA || !optionB || !optionC || !optionD)) {
      Alert.alert('Perhatian', 'Pilihan A-D wajib diisi (E opsional) untuk soal Pilihan Ganda')
      return
    }

    setSaving(true)

    let finalImageUrl = question.image_url || null
    if (imageChanged) {
      if (imageUri) {
        const { url, error: uploadError } = await uploadQuestionImage(imageUri, session?.user?.id)
        if (uploadError) {
          setSaving(false)
          Alert.alert('Gagal Upload Gambar', uploadError.message)
          return
        }
        finalImageUrl = url
      } else {
        finalImageUrl = null
      }
    }

    const updates = {
      question_text: questionText,
      question_type: questionType,
      image_url: finalImageUrl,
      option_a: questionType === 'pilihan_ganda' ? optionA : null,
      option_b: questionType === 'pilihan_ganda' ? optionB : null,
      option_c: questionType === 'pilihan_ganda' ? optionC : null,
      option_d: questionType === 'pilihan_ganda' ? optionD : null,
      option_e: questionType === 'pilihan_ganda' ? optionE || null : null,
      correct_option: questionType === 'pilihan_ganda' ? correct : null,
    }

    const { error } = await updateQuestion(question.id, updates)
    setSaving(false)

    if (error) {
      Alert.alert('Gagal Menyimpan', error.message)
    } else {
      Alert.alert('Berhasil', 'Soal berhasil diperbarui', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ])
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.header}>Edit Soal</Text>

      <Text style={styles.label}>Jenis Soal</Text>
      <View style={styles.optionRow}>
        {[
          { key: 'pilihan_ganda', label: 'Pilihan Ganda' },
          { key: 'essay', label: 'Essay' },
        ].map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[styles.typeButton, questionType === opt.key && styles.optionSelected]}
            onPress={() => setQuestionType(opt.key)}
          >
            <Text style={questionType === opt.key ? { color: '#fff' } : {}}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Tulis pertanyaan..."
        multiline
        value={questionText}
        onChangeText={setQuestionText}
      />

      <Text style={styles.label}>Gambar Soal (opsional)</Text>
      {imageUri ? (
        <View style={styles.imagePreviewWrap}>
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          <TouchableOpacity style={styles.removeImageBtn} onPress={removeImage}>
            <Text style={{ color: '#fff', fontSize: 12 }}>Hapus Gambar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.pickImageBtn} onPress={pickImage}>
          <Text style={{ color: '#1B5E20' }}>+ Pilih Gambar</Text>
        </TouchableOpacity>
      )}

      {questionType === 'pilihan_ganda' && (
        <>
          <TextInput style={styles.input} placeholder="Pilihan A" value={optionA} onChangeText={setOptionA} />
          <TextInput style={styles.input} placeholder="Pilihan B" value={optionB} onChangeText={setOptionB} />
          <TextInput style={styles.input} placeholder="Pilihan C" value={optionC} onChangeText={setOptionC} />
          <TextInput style={styles.input} placeholder="Pilihan D" value={optionD} onChangeText={setOptionD} />
          <TextInput style={styles.input} placeholder="Pilihan E (opsional)" value={optionE} onChangeText={setOptionE} />

          <Text style={styles.label}>Kunci Jawaban</Text>
          <View style={styles.optionRow}>
            {['a', 'b', 'c', 'd', 'e'].map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.optionButton, correct === opt && styles.optionSelected]}
                onPress={() => setCorrect(opt)}
              >
                <Text style={correct === opt ? { color: '#fff' } : {}}>{opt.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {questionType === 'essay' && (
        <Text style={styles.essayNote}>
          Soal essay akan dinilai manual oleh guru saat memeriksa hasil ujian siswa.
        </Text>
      )}

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Simpan Perubahan</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>Batal</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  label: { fontWeight: '600', marginTop: 8, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 10 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  optionButton: { borderWidth: 1, borderColor: '#1B5E20', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16 },
  typeButton: { borderWidth: 1, borderColor: '#1B5E20', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14 },
  optionSelected: { backgroundColor: '#1B5E20' },
  essayNote: { color: '#666', fontStyle: 'italic', marginBottom: 16 },
  pickImageBtn: {
    borderWidth: 1, borderColor: '#1B5E20', borderStyle: 'dashed', borderRadius: 8,
    padding: 14, alignItems: 'center', marginBottom: 16,
  },
  imagePreviewWrap: { marginBottom: 16 },
  imagePreview: { width: '100%', height: 160, borderRadius: 8, marginBottom: 8 },
  removeImageBtn: {
    alignSelf: 'flex-start', backgroundColor: '#E53935', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6,
  },
  button: { backgroundColor: '#1B5E20', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  cancelButton: { padding: 14, alignItems: 'center', marginTop: 8 },
  cancelText: { color: '#888', fontWeight: '600' },
})
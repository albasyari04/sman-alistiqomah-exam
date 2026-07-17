import { useState } from 'react'
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Image, ActivityIndicator, ScrollView } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useAuth } from '../../context/AuthContext'
import { addQuestion, uploadQuestionImage } from '../../services/questionService'
import BottomNavGuru from '../../components/BottomNavGuru'

export default function TambahSoalScreen({ route, navigation }) {
  const { examId, examTitle } = route.params
  const { session } = useAuth()

  const [questionType, setQuestionType] = useState('pilihan_ganda') // 'pilihan_ganda' | 'essay'
  const [questionText, setQuestionText] = useState('')
  const [optionA, setOptionA] = useState('')
  const [optionB, setOptionB] = useState('')
  const [optionC, setOptionC] = useState('')
  const [optionD, setOptionD] = useState('')
  const [optionE, setOptionE] = useState('')
  const [correct, setCorrect] = useState('a')
  const [imageUri, setImageUri] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [addedCount, setAddedCount] = useState(0)

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
    }
  }

  function resetForm() {
    setQuestionText('')
    setOptionA(''); setOptionB(''); setOptionC(''); setOptionD(''); setOptionE('')
    setCorrect('a')
    setImageUri(null)
  }

  async function handleAddQuestion() {
    if (!questionText) {
      Alert.alert('Perhatian', 'Pertanyaan wajib diisi')
      return
    }
    if (questionType === 'pilihan_ganda' && (!optionA || !optionB || !optionC || !optionD)) {
      Alert.alert('Perhatian', 'Pilihan A-D wajib diisi (E opsional) untuk soal Pilihan Ganda')
      return
    }

    let imageUrl = null
    if (imageUri) {
      setUploading(true)
      const { url, error: uploadError } = await uploadQuestionImage(imageUri, session?.user?.id)
      setUploading(false)
      if (uploadError) {
        Alert.alert('Gagal Upload Gambar', uploadError.message)
        return
      }
      imageUrl = url
    }

    const { error } = await addQuestion(
      examId,
      {
        text: questionText,
        a: questionType === 'pilihan_ganda' ? optionA : null,
        b: questionType === 'pilihan_ganda' ? optionB : null,
        c: questionType === 'pilihan_ganda' ? optionC : null,
        d: questionType === 'pilihan_ganda' ? optionD : null,
        e: questionType === 'pilihan_ganda' ? optionE : null,
        correct: questionType === 'pilihan_ganda' ? correct : null,
        type: questionType,
        imageUrl,
      },
      addedCount + 1
    )

    if (error) {
      Alert.alert('Gagal', error.message)
    } else {
      setAddedCount(addedCount + 1)
      resetForm()
      Alert.alert('Berhasil', `Soal #${addedCount + 1} ditambahkan`)
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <Text style={styles.header}>{examTitle}</Text>
      <Text style={styles.counter}>Soal ditambahkan: {addedCount}</Text>

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
          <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImageUri(null)}>
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

      <TouchableOpacity style={styles.button} onPress={handleAddQuestion} disabled={uploading}>
        {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>+ Tambah Soal</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { marginTop: 10 }]}
        onPress={() => navigation.navigate('ImportSoal', { examId })}
      >
        <Text style={styles.buttonText}>Import Soal dari File (CSV/Word)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.doneButton}
        onPress={() => navigation.navigate('DaftarUjianGuru')}
      >
        <Text style={styles.doneText}>Selesai ({addedCount} soal tersimpan)</Text>
      </TouchableOpacity>
      </ScrollView>

      <BottomNavGuru navigation={navigation} active="Ujian" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 20, paddingBottom: 12 },
  header: { fontSize: 18, fontWeight: 'bold' },
  counter: { color: '#666', marginBottom: 16 },
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
  doneButton: { padding: 14, alignItems: 'center', marginTop: 4 },
  doneText: { color: '#1B5E20', fontWeight: '600' },
})
import { useState } from 'react'
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Platform, ScrollView } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { createExam } from '../../services/examService'
import { useAuth } from '../../context/AuthContext'
import BottomNavGuru from '../../components/BottomNavGuru'

export default function BuatUjianScreen({ navigation }) {
  const { profile } = useAuth()
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [duration, setDuration] = useState('60')
  const [startTime, setStartTime] = useState(new Date())
  const [endTime, setEndTime] = useState(new Date())

  // 'start' | 'end' | null -> menentukan field mana yang sedang diedit
  const [activeField, setActiveField] = useState(null)
  // 'date' | 'time' -> tahap picker yang sedang tampil (khusus Android)
  const [pickerStage, setPickerStage] = useState('date')

  function openPicker(field) {
    setActiveField(field)
    setPickerStage('date')
  }

  function handleChange(event, selectedDate) {
    if (event.type === 'dismissed' || !selectedDate) {
      setActiveField(null)
      return
    }

    if (Platform.OS === 'android') {
      if (pickerStage === 'date') {
        // Simpan tanggal dulu, lanjut ke tahap pilih jam
        const updater = (prev) => {
          const merged = new Date(prev)
          merged.setFullYear(selectedDate.getFullYear())
          merged.setMonth(selectedDate.getMonth())
          merged.setDate(selectedDate.getDate())
          return merged
        }
        if (activeField === 'start') setStartTime(updater)
        else setEndTime(updater)
        setPickerStage('time')
      } else {
        // Tahap jam selesai, gabungkan jam:menit ke tanggal yang sudah dipilih
        const updater = (prev) => {
          const merged = new Date(prev)
          merged.setHours(selectedDate.getHours())
          merged.setMinutes(selectedDate.getMinutes())
          return merged
        }
        if (activeField === 'start') setStartTime(updater)
        else setEndTime(updater)
        setActiveField(null)
      }
    } else {
      // iOS mendukung mode datetime langsung
      if (activeField === 'start') setStartTime(selectedDate)
      else setEndTime(selectedDate)
      setActiveField(null)
    }
  }

  async function handleSubmit() {
    if (!title || !subject) {
      Alert.alert('Perhatian', 'Judul dan mata pelajaran wajib diisi')
      return
    }

    const { data, error } = await createExam(
      { title, subject, startTime, endTime, duration: parseInt(duration) },
      profile.id
    )

    if (error) {
      Alert.alert('Gagal', error.message)
    } else {
      Alert.alert('Berhasil', 'Ujian dibuat. Sekarang tambahkan soal.')
      navigation.replace('TambahSoal', { examId: data.id, examTitle: data.title })
    }
  }

  return (
    <View style={styles.screen}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Judul Ujian</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Contoh: UAS Matematika" />

      <Text style={styles.label}>Mata Pelajaran</Text>
      <TextInput style={styles.input} value={subject} onChangeText={setSubject} placeholder="Contoh: Matematika" />

      <Text style={styles.label}>Durasi (menit)</Text>
      <TextInput style={styles.input} value={duration} onChangeText={setDuration} keyboardType="numeric" />

      <Text style={styles.label}>Waktu Mulai</Text>
      <TouchableOpacity style={styles.input} onPress={() => openPicker('start')}>
        <Text>{startTime.toLocaleString('id-ID')}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Waktu Selesai</Text>
      <TouchableOpacity style={styles.input} onPress={() => openPicker('end')}>
        <Text>{endTime.toLocaleString('id-ID')}</Text>
      </TouchableOpacity>

      {activeField && Platform.OS === 'android' && (
        <DateTimePicker
          value={activeField === 'start' ? startTime : endTime}
          mode={pickerStage}
          is24Hour
          onChange={handleChange}
        />
      )}

      {activeField && Platform.OS === 'ios' && (
        <DateTimePicker
          value={activeField === 'start' ? startTime : endTime}
          mode="datetime"
          onChange={handleChange}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Buat Ujian & Lanjut Tambah Soal</Text>
      </TouchableOpacity>
      </ScrollView>

      <BottomNavGuru navigation={navigation} active="Ujian" />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 20, paddingBottom: 32 },
  label: { fontWeight: '600', marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12 },
  button: { backgroundColor: '#1B5E20', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontWeight: '600' },
})
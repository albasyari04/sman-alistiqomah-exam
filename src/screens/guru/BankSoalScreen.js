import { useCallback, useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SectionList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Image,
  ScrollView,
  Alert,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import Svg, { Path, Circle } from 'react-native-svg'
import BottomNavGuru from '../../components/BottomNavGuru'
import { useAuth } from '../../context/AuthContext'
import { getExamsByGuru } from '../../services/examService'
import {
  getAllQuestionsByGuru,
  getUsedQuestionIds,
  deleteQuestion,
} from '../../services/questionService'

/* ---------------------------------- Icons ---------------------------------- */

function BankSoalIllustration() {
  return (
    <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
      <Path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="#8E44AD" strokeWidth={1.6} strokeLinejoin="round"/>
      <Path d="M9 9h6M9 12.5h6M9 16h4" stroke="#8E44AD" strokeWidth={1.5} strokeLinecap="round"/>
    </Svg>
  )
}

function ChevronDown({ color = '#666', size = 14 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  )
}

function ChevronUp({ color = '#666', size = 14 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 15l-6-6-6 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  )
}

function SearchIcon({ color = '#9B9B9B', size = 16 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={7} stroke={color} strokeWidth={2}/>
      <Path d="M21 21l-4.35-4.35" stroke={color} strokeWidth={2} strokeLinecap="round"/>
    </Svg>
  )
}

function PlusIcon({ color = '#fff', size = 14 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2.4} strokeLinecap="round"/>
    </Svg>
  )
}

function EyeIcon({ color = '#2E7D32', size = 15 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round"/>
      <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={1.8}/>
    </Svg>
  )
}

function PencilIcon({ color = '#1565C0', size = 15 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round"/>
    </Svg>
  )
}

function TrashIcon({ color = '#E53935', size = 15 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0-.8 13.2A2 2 0 0 1 15.2 21H8.8a2 2 0 0 1-2-1.8L6 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M10 11v6M14 11v6" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    </Svg>
  )
}

function BookIcon({ color = '#8E44AD', size = 18 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" stroke={color} strokeWidth={1.7} strokeLinejoin="round"/>
      <Path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" stroke={color} strokeWidth={1.7} strokeLinejoin="round"/>
    </Svg>
  )
}

function CheckBadgeIcon({ color = '#8E44AD', size = 12 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2}/>
      <Path d="M8.5 12.5l2.3 2.3L16 10" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  )
}

/* ------------------------------- Subject theme ------------------------------ */

const SUBJECT_COLORS = [
  { bg: '#F3E5F5', text: '#8E44AD' }, // purple
  { bg: '#E3F2FD', text: '#1565C0' }, // blue
  { bg: '#E8F5E9', text: '#2E7D32' }, // green
  { bg: '#FFF3E0', text: '#EF6C00' }, // orange
  { bg: '#FCE4EC', text: '#C2185B' }, // pink
  { bg: '#E0F2F1', text: '#00796B' }, // teal
]

function colorForIndex(idx) {
  return SUBJECT_COLORS[idx % SUBJECT_COLORS.length]
}

/* ---------------------------------- UI bits --------------------------------- */

function FilterDropdown({ label, value, options, onSelect }) {
  const [open, setOpen] = useState(false)
  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity style={styles.filterButton} onPress={() => setOpen(true)}>
        <Text style={styles.filterButtonText} numberOfLines={1}>{value || label}</Text>
        <ChevronDown />
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{label}</Text>
            <ScrollView style={{ maxHeight: 320 }}>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => { onSelect(null); setOpen(false) }}
              >
                <Text style={styles.modalOptionText}>Semua</Text>
              </TouchableOpacity>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.modalOption}
                  onPress={() => { onSelect(opt); setOpen(false) }}
                >
                  <Text style={styles.modalOptionText}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

function SubjectSectionHeader({ title, count, color, collapsed, onToggle }) {
  return (
    <TouchableOpacity style={styles.sectionHeader} onPress={onToggle} activeOpacity={0.7}>
      <View style={[styles.sectionIconWrap, { backgroundColor: color.bg }]}>
        <BookIcon color={color.text} size={17} />
      </View>
      <Text style={styles.sectionTitle} numberOfLines={1}>{title}</Text>
      <View style={[styles.sectionCountPill, { backgroundColor: color.bg }]}>
        <Text style={[styles.sectionCountText, { color: color.text }]}>{count}</Text>
      </View>
      {collapsed ? <ChevronDown color="#9B9B9B" /> : <ChevronUp color="#9B9B9B" />}
    </TouchableOpacity>
  )
}

function SoalCard({ item, isUsed, onView, onEdit, onDelete }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <Text style={styles.tagKelas}>{item.exams?.kelas || 'Semua Kelas'}</Text>
        {isUsed ? (
          <View style={styles.usedBadge}>
            <CheckBadgeIcon color="#2E7D32" size={11} />
            <Text style={styles.usedBadgeText}>Terpakai</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.cardQuestion} numberOfLines={3}>{item.question_text}</Text>
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.cardImage} />
      ) : null}
      <View style={styles.cardDivider} />
      <View style={styles.cardActionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onView(item)}>
          <EyeIcon />
          <Text style={[styles.actionText, { color: '#2E7D32' }]}>Lihat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit(item)}>
          <PencilIcon />
          <Text style={[styles.actionText, { color: '#1565C0' }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onDelete(item)}>
          <TrashIcon />
          <Text style={[styles.actionText, { color: '#E53935' }]}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

/* --------------------------------- Screen ----------------------------------- */

export default function BankSoalScreen({ navigation }) {
  const { session } = useAuth()
  const userId = session?.user?.id

  const [questions, setQuestions] = useState([])
  const [usedIds, setUsedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [selectedKelas, setSelectedKelas] = useState(null)
  const [collapsedSubjects, setCollapsedSubjects] = useState(new Set())

  const [examPickerVisible, setExamPickerVisible] = useState(false)
  const [examsForPicker, setExamsForPicker] = useState([])

  const [detailQuestion, setDetailQuestion] = useState(null)

  async function loadData() {
    if (!userId) return
    const { data, error } = await getAllQuestionsByGuru(userId)
    if (error) {
      console.log('Gagal ambil soal:', error.message)
      setQuestions([])
      return
    }
    setQuestions(data || [])

    const examIds = [...new Set((data || []).map((q) => q.exam_id))]
    const { data: usedData } = await getUsedQuestionIds(examIds)
    setUsedIds(new Set((usedData || []).map((r) => r.question_id)))
  }

  useFocusEffect(
    useCallback(() => {
      setLoading(true)
      loadData().finally(() => setLoading(false))
    }, [userId])
  )

  const subjectOptions = useMemo(
    () => [...new Set(questions.map((q) => q.exams?.subject).filter(Boolean))],
    [questions]
  )
  const kelasOptions = useMemo(
    () => [...new Set(questions.map((q) => q.exams?.kelas).filter(Boolean))],
    [questions]
  )

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchSearch = search.trim() === '' ||
        q.question_text?.toLowerCase().includes(search.trim().toLowerCase())
      const matchSubject = !selectedSubject || q.exams?.subject === selectedSubject
      const matchKelas = !selectedKelas || q.exams?.kelas === selectedKelas
      return matchSearch && matchSubject && matchKelas
    })
  }, [questions, search, selectedSubject, selectedKelas])

  const groupedSections = useMemo(() => {
    const map = new Map()
    filteredQuestions.forEach((q) => {
      const subject = q.exams?.subject || 'Tanpa Mapel'
      if (!map.has(subject)) map.set(subject, [])
      map.get(subject).push(q)
    })
    const subjects = [...map.keys()].sort((a, b) => {
      if (a === 'Tanpa Mapel') return 1
      if (b === 'Tanpa Mapel') return -1
      return a.localeCompare(b)
    })
    return subjects.map((subject, idx) => {
      const items = map.get(subject)
      const isCollapsed = collapsedSubjects.has(subject)
      return {
        title: subject,
        count: items.length,
        color: colorForIndex(idx),
        data: isCollapsed ? [] : items,
      }
    })
  }, [filteredQuestions, collapsedSubjects])

  function toggleSubject(subject) {
    setCollapsedSubjects((prev) => {
      const next = new Set(prev)
      if (next.has(subject)) next.delete(subject)
      else next.add(subject)
      return next
    })
  }

  const stats = useMemo(() => {
    return {
      total: questions.length,
      totalMapel: subjectOptions.length,
      digunakan: questions.filter((q) => usedIds.has(q.id)).length,
    }
  }, [questions, subjectOptions, usedIds])

  async function openAddSoal() {
    if (!userId) return
    const { data, error } = await getExamsByGuru(userId)
    if (error) {
      Alert.alert('Gagal', 'Tidak bisa mengambil daftar ujian: ' + error.message)
      return
    }
    if (!data || data.length === 0) {
      Alert.alert('Belum Ada Ujian', 'Buat ujian terlebih dahulu sebelum menambahkan soal.')
      return
    }
    setExamsForPicker(data)
    setExamPickerVisible(true)
  }

  function handlePickExam(exam) {
    setExamPickerVisible(false)
    navigation.navigate('TambahSoal', { examId: exam.id, examTitle: exam.title })
  }

  function handleEdit(question) {
    navigation.navigate('EditSoal', { question })
  }

  function handleDelete(question) {
    Alert.alert(
      'Hapus Soal',
      'Yakin ingin menghapus soal ini? Tindakan ini tidak bisa dibatalkan.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteQuestion(question.id)
            if (error) {
              Alert.alert('Gagal Menghapus', error.message)
            } else {
              setQuestions((prev) => prev.filter((q) => q.id !== question.id))
            }
          },
        },
      ]
    )
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.screen}>
        <View style={styles.headerRow}>
          <Text style={styles.headerSubtitle}>Kelola koleksi soal ujian Anda</Text>
          <TouchableOpacity style={styles.addButton} onPress={openAddSoal} activeOpacity={0.85}>
            <PlusIcon />
            <Text style={styles.addButtonText}>Tambah</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Soal</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.totalMapel}</Text>
            <Text style={styles.statLabel}>Mata Pelajaran</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.digunakan}</Text>
            <Text style={styles.statLabel}>Digunakan</Text>
          </View>
        </View>

        <View style={styles.searchWrap}>
          <SearchIcon />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari soal..."
            placeholderTextColor="#9B9B9B"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.filterRow}>
          <FilterDropdown
            label="Mata Pelajaran"
            value={selectedSubject}
            options={subjectOptions}
            onSelect={setSelectedSubject}
          />
          <FilterDropdown
            label="Kelas"
            value={selectedKelas}
            options={kelasOptions}
            onSelect={setSelectedKelas}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#8E44AD" style={{ marginTop: 40 }} />
        ) : filteredQuestions.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.iconWrap}>
              <BankSoalIllustration />
            </View>
            <Text style={styles.emptyTitle}>
              {questions.length === 0 ? 'Belum ada soal' : 'Soal tidak ditemukan'}
            </Text>
            <Text style={styles.emptyDesc}>
              {questions.length === 0
                ? 'Tambahkan soal lewat tombol "Tambah" di atas.'
                : 'Coba ubah kata kunci pencarian atau filter.'}
            </Text>
          </View>
        ) : (
          <SectionList
            sections={groupedSections}
            keyExtractor={(item) => item.id}
            renderSectionHeader={({ section }) => (
              <SubjectSectionHeader
                title={section.title}
                count={section.count}
                color={section.color}
                collapsed={collapsedSubjects.has(section.title)}
                onToggle={() => toggleSubject(section.title)}
              />
            )}
            renderItem={({ item }) => (
              <SoalCard
                item={item}
                isUsed={usedIds.has(item.id)}
                onView={setDetailQuestion}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
            stickySectionHeadersEnabled={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Modal pilih ujian saat "Tambah" */}
      <Modal visible={examPickerVisible} transparent animationType="fade" onRequestClose={() => setExamPickerVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setExamPickerVisible(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Pilih Ujian untuk Soal Baru</Text>
            <ScrollView style={{ maxHeight: 320 }}>
              {examsForPicker.map((exam) => (
                <TouchableOpacity key={exam.id} style={styles.modalOption} onPress={() => handlePickExam(exam)}>
                  <Text style={styles.modalOptionText}>{exam.title}</Text>
                  <Text style={styles.modalOptionSubtext}>{exam.subject}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal detail (Lihat) */}
      <Modal visible={!!detailQuestion} transparent animationType="fade" onRequestClose={() => setDetailQuestion(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setDetailQuestion(null)}>
          <View style={styles.modalSheet}>
            {detailQuestion && (
              <ScrollView style={{ maxHeight: 420 }}>
                <Text style={styles.modalTitle}>{detailQuestion.exams?.subject} · {detailQuestion.exams?.kelas || 'Semua Kelas'}</Text>
                <Text style={styles.detailQuestion}>{detailQuestion.question_text}</Text>
                {detailQuestion.image_url ? (
                  <Image source={{ uri: detailQuestion.image_url }} style={styles.detailImage} />
                ) : null}
                {detailQuestion.question_type === 'essay' ? (
                  <Text style={styles.essayNote}>Soal Essay — dinilai manual oleh guru.</Text>
                ) : (
                  ['a', 'b', 'c', 'd', 'e'].map((opt) => {
                    const text = detailQuestion[`option_${opt}`]
                    if (!text) return null
                    const isCorrect = detailQuestion.correct_option === opt
                    return (
                      <View key={opt} style={[styles.detailOption, isCorrect && styles.detailOptionCorrect]}>
                        <Text style={isCorrect ? styles.detailOptionCorrectText : styles.detailOptionText}>
                          {opt.toUpperCase()}. {text} {isCorrect ? ' ✓' : ''}
                        </Text>
                      </View>
                    )
                  })
                )}
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <BottomNavGuru navigation={navigation} active="" />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#F7F8FA' },
  screen: { flex: 1, padding: 16 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  headerSubtitle: { fontSize: 13, color: '#8A8A8A', flexShrink: 1, marginRight: 12 },
  addButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#8E44AD', paddingVertical: 9, paddingHorizontal: 16, borderRadius: 10,
    shadowColor: '#8E44AD', shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  statsRow: { flexDirection: 'row', marginBottom: 14, gap: 10 },
  statBox: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, paddingVertical: 12, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  statValue: { fontSize: 18, fontWeight: '800', color: '#1B1B1B' },
  statLabel: { fontSize: 11, color: '#8A8A8A', marginTop: 2, textAlign: 'center' },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 10, borderWidth: 1, borderColor: '#EEE',
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1B1B1B', padding: 0 },

  filterRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  filterButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: '#EEE',
  },
  filterButtonText: { fontSize: 13, color: '#444', flexShrink: 1 },

  emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  iconWrap: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: '#F3E5F5',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1B1B1B', marginBottom: 6 },
  emptyDesc: { fontSize: 13, color: '#8A8A8A', textAlign: 'center', lineHeight: 19, paddingHorizontal: 20 },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12,
    marginTop: 12, marginBottom: 8,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  sectionIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: '#1B1B1B' },
  sectionCountPill: { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3, marginRight: 4 },
  sectionCountText: { fontSize: 12, fontWeight: '700' },

  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#F2F2F2',
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  tagKelas: { color: '#8A8A8A', fontSize: 12, fontWeight: '600' },
  usedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#E8F5E9', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3,
  },
  usedBadgeText: { color: '#2E7D32', fontSize: 11, fontWeight: '700' },
  cardQuestion: { fontSize: 14, color: '#1B1B1B', lineHeight: 20 },
  cardImage: { width: '100%', height: 130, borderRadius: 10, marginTop: 10 },
  cardDivider: { height: 1, backgroundColor: '#F2F2F2', marginTop: 12, marginBottom: 10 },
  cardActionsRow: { flexDirection: 'row', gap: 20 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4 },
  actionText: { fontSize: 13, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  modalSheet: { backgroundColor: '#fff', borderRadius: 14, padding: 18, maxHeight: '80%' },
  modalTitle: { fontSize: 15, fontWeight: '700', color: '#1B1B1B', marginBottom: 10 },
  modalOption: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  modalOptionText: { fontSize: 14, color: '#1B1B1B' },
  modalOptionSubtext: { fontSize: 12, color: '#8A8A8A', marginTop: 2 },

  detailQuestion: { fontSize: 15, color: '#1B1B1B', lineHeight: 21, marginBottom: 10 },
  detailImage: { width: '100%', height: 160, borderRadius: 8, marginBottom: 10 },
  detailOption: { borderWidth: 1, borderColor: '#EEE', borderRadius: 8, padding: 10, marginBottom: 8 },
  detailOptionCorrect: { borderColor: '#1B5E20', backgroundColor: '#E8F5E9' },
  detailOptionText: { color: '#444' },
  detailOptionCorrectText: { color: '#1B5E20', fontWeight: '700' },
  essayNote: { color: '#666', fontStyle: 'italic', marginTop: 4 },
})
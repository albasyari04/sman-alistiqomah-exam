import { useState, useEffect, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput,
  ActivityIndicator, RefreshControl, Modal, Alert, KeyboardAvoidingView, Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path, Circle } from 'react-native-svg'
import { useAuth } from '../../context/AuthContext'
import {
  getMyPengumuman, createPengumuman, updatePengumuman, deletePengumuman, getDistinctKelas,
} from '../../services/pengumumanService'

// ---------- Icons ----------
function IconPlus({ color = '#fff', size = 22 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  )
}
function IconEdit({ color = '#1B5E20', size = 16 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 20h4l10.5-10.5a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4 16v4Z" stroke={color} strokeWidth={1.7} strokeLinejoin="round" />
    </Svg>
  )
}
function IconTrash({ color = '#c0392b', size = 16 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}
function IconClose({ color = '#1A1D1B', size = 20 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 6l12 12M18 6 6 18" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  )
}
function IconMegaphoneEmpty({ color }) {
  return (
    <Svg width={46} height={46} viewBox="0 0 24 24" fill="none">
      <Path d="M4 10v4a1 1 0 0 0 1 1h2l7 4V5L7 9H5a1 1 0 0 0-1 1Z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      <Circle cx={18.5} cy={12} r={2.2} stroke={color} strokeWidth={1.5} />
    </Svg>
  )
}

const CATEGORIES = [
  { key: 'umum', label: 'Umum', color: '#8E5FD8', bg: '#F1EAFB' },
  { key: 'akademik', label: 'Akademik', color: '#1B5E20', bg: '#E4EFE5' },
  { key: 'ujian', label: 'Ujian', color: '#B9770E', bg: '#FDF2E3' },
  { key: 'libur', label: 'Libur', color: '#1F6FB2', bg: '#E3F0FB' },
]

function categoryInfo(key) {
  return CATEGORIES.find((c) => c.key === key) || CATEGORIES[0]
}

function formatTanggal(iso) {
  const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const d = new Date(iso)
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`
}

const EMPTY_FORM = { title: '', content: '', category: 'umum', targetKelas: [] }

export default function PengumumanScreen() {
  const { profile } = useAuth()
  const [items, setItems] = useState([])
  const [kelasOptions, setKelasOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(async () => {
    if (!profile?.id) return
    setError(null)
    const [listRes, kelasRes] = await Promise.all([
      getMyPengumuman(profile.id),
      getDistinctKelas(),
    ])
    if (listRes.error) {
      setError(listRes.error.message)
    } else {
      setItems(listRes.data || [])
    }
    setKelasOptions(kelasRes.data || [])
  }, [profile?.id])

  useEffect(() => {
    setLoading(true)
    loadData().finally(() => setLoading(false))
  }, [loadData])

  async function onRefresh() {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setModalVisible(true)
  }

  function openEdit(item) {
    setEditingId(item.id)
    setForm({
      title: item.title,
      content: item.content,
      category: item.category,
      targetKelas: item.target_kelas || [],
    })
    setModalVisible(true)
  }

  function toggleKelasChip(kelas) {
    setForm((prev) => ({
      ...prev,
      targetKelas: prev.targetKelas.includes(kelas)
        ? prev.targetKelas.filter((k) => k !== kelas)
        : [...prev.targetKelas, kelas],
    }))
  }

  async function handleSave() {
    if (!form.title.trim() || !form.content.trim()) {
      Alert.alert('Belum Lengkap', 'Judul dan isi pengumuman wajib diisi.')
      return
    }
    setSaving(true)
    const { error: saveError } = editingId
      ? await updatePengumuman(editingId, form)
      : await createPengumuman(profile.id, form)
    setSaving(false)

    if (saveError) {
      Alert.alert('Gagal Menyimpan', saveError.message)
      return
    }
    setModalVisible(false)
    loadData()
  }

  function handleDelete(item) {
    Alert.alert('Hapus Pengumuman?', `"${item.title}" akan dihapus permanen.`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          const { error: deleteError } = await deletePengumuman(item.id)
          if (deleteError) Alert.alert('Gagal', deleteError.message)
          else loadData()
        },
      },
    ])
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]} edges={['bottom']}>
        <ActivityIndicator size="large" color="#1B5E20" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1B5E20']} />}
      >
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {items.length === 0 && !error && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <IconMegaphoneEmpty color="#B7BCB8" />
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Pengumuman</Text>
            <Text style={styles.emptyDesc}>Buat pengumuman pertama Anda untuk siswa dengan tombol + di bawah.</Text>
          </View>
        )}

        {items.map((item) => {
          const cat = categoryInfo(item.category)
          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={[styles.catBadge, { backgroundColor: cat.bg }]}>
                  <Text style={[styles.catBadgeText, { color: cat.color }]}>{cat.label}</Text>
                </View>
                <Text style={styles.cardDate}>{formatTanggal(item.created_at)}</Text>
              </View>

              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardContent} numberOfLines={3}>{item.content}</Text>

              <Text style={styles.cardTarget}>
                {item.target_kelas && item.target_kelas.length > 0
                  ? `Untuk: ${item.target_kelas.join(', ')}`
                  : 'Untuk: Semua Kelas'}
              </Text>

              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(item)}>
                  <IconEdit />
                  <Text style={styles.actionBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item)}>
                  <IconTrash />
                  <Text style={[styles.actionBtnText, { color: '#c0392b' }]}>Hapus</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        })}
      </ScrollView>

      <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={openCreate}>
        <IconPlus />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? 'Edit Pengumuman' : 'Buat Pengumuman'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <IconClose />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              <Text style={styles.fieldLabel}>Judul</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: Jadwal Ujian Akhir Semester"
                placeholderTextColor="#A7ACA8"
                value={form.title}
                onChangeText={(v) => setForm((p) => ({ ...p, title: v }))}
              />

              <Text style={styles.fieldLabel}>Isi Pengumuman</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Tuliskan detail pengumuman di sini..."
                placeholderTextColor="#A7ACA8"
                value={form.content}
                onChangeText={(v) => setForm((p) => ({ ...p, content: v }))}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />

              <Text style={styles.fieldLabel}>Kategori</Text>
              <View style={styles.chipRow}>
                {CATEGORIES.map((c) => {
                  const active = form.category === c.key
                  return (
                    <TouchableOpacity
                      key={c.key}
                      style={[styles.chip, active && { backgroundColor: c.color, borderColor: c.color }]}
                      onPress={() => setForm((p) => ({ ...p, category: c.key }))}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.label}</Text>
                    </TouchableOpacity>
                  )
                })}
              </View>

              <Text style={styles.fieldLabel}>Target Kelas</Text>
              <Text style={styles.fieldHint}>Kosongkan semua untuk mengirim ke semua kelas.</Text>
              <View style={styles.chipRow}>
                {kelasOptions.length === 0 && (
                  <Text style={styles.fieldHint}>Belum ada data kelas siswa.</Text>
                )}
                {kelasOptions.map((k) => {
                  const active = form.targetKelas.includes(k)
                  return (
                    <TouchableOpacity
                      key={k}
                      style={[styles.chip, active && styles.chipActiveGreen]}
                      onPress={() => toggleKelasChip(k)}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{k}</Text>
                    </TouchableOpacity>
                  )
                })}
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : (
                  <Text style={styles.saveButtonText}>{editingId ? 'Simpan Perubahan' : 'Publikasikan'}</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  )
}

const CARD_SHADOW = {
  shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2,
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7F5' },
  center: { alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 20, paddingBottom: 100 },

  errorBanner: { backgroundColor: '#FDECEA', borderRadius: 12, padding: 12, marginBottom: 14 },
  errorText: { color: '#c0392b', fontSize: 12.5 },

  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 30 },
  emptyIconWrap: {
    width: 84, height: 84, borderRadius: 42, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16, ...CARD_SHADOW,
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#1A1D1B', marginBottom: 6 },
  emptyDesc: { fontSize: 12.5, color: '#8A8F8B', textAlign: 'center', lineHeight: 18 },

  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, ...CARD_SHADOW },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  catBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  catBadgeText: { fontSize: 10.5, fontWeight: '700' },
  cardDate: { fontSize: 11, color: '#A7ACA8' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1A1D1B', marginBottom: 4 },
  cardContent: { fontSize: 12.5, color: '#5A5F5B', lineHeight: 18, marginBottom: 8 },
  cardTarget: { fontSize: 11, color: '#8A8F8B', fontStyle: 'italic', marginBottom: 10 },
  cardActions: { flexDirection: 'row', gap: 18, borderTopWidth: 1, borderTopColor: '#F0F2F0', paddingTop: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionBtnText: { fontSize: 12.5, fontWeight: '600', color: '#1B5E20' },

  fab: {
    position: 'absolute', right: 20, bottom: 24, width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#1B5E20', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: '88%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 16.5, fontWeight: '700', color: '#1A1D1B' },
  modalScroll: {},

  fieldLabel: { fontSize: 12.5, fontWeight: '700', color: '#1A1D1B', marginBottom: 6, marginTop: 14 },
  fieldHint: { fontSize: 11, color: '#8A8F8B', marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: '#DDE2DE', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 13.5, color: '#1A1D1B', backgroundColor: '#FAFBFA',
  },
  inputMultiline: { minHeight: 110 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1.3, borderColor: '#DDE2DE', borderRadius: 20, paddingHorizontal: 13, paddingVertical: 7,
    backgroundColor: '#fff',
  },
  chipActiveGreen: { backgroundColor: '#1B5E20', borderColor: '#1B5E20' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#5A5F5B' },
  chipTextActive: { color: '#fff' },

  saveButton: {
    backgroundColor: '#1B5E20', borderRadius: 12, paddingVertical: 14, alignItems: 'center',
    marginTop: 22, marginBottom: 30,
  },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
})
import * as FileSystem from 'expo-file-system'
import JSZip from 'jszip'
import { supabase } from '../lib/supabase'

function decodeXmlEntities(str) {
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
}

// Ambil teks mentah dari .docx TANPA asumsi format (beda dengan docxImportService.js)
async function extractDocxPlainText(fileUri) {
  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  })
  const zip = await JSZip.loadAsync(base64, { base64: true })
  const xmlFile = zip.file('word/document.xml')
  if (!xmlFile) throw new Error('File .docx tidak valid')
  const xml = await xmlFile.async('string')

  const paraBlocks = xml.match(/<w:p[ >][\s\S]*?<\/w:p>/g) || []
  const lines = paraBlocks.map((block) => {
    const tokenRegex = /<w:t[^>]*>([\s\S]*?)<\/w:t>|<w:tab\/>|<w:br\/>/g
    let text = ''
    let match
    while ((match = tokenRegex.exec(block)) !== null) {
      if (match[1] !== undefined) text += decodeXmlEntities(match[1])
      else if (match[0] === '<w:tab/>') text += '\t'
      else if (match[0] === '<w:br/>') text += '\n'
    }
    return text.trim()
  })

  return lines.filter(Boolean).join('\n')
}

const EXT_MIME = {
  pdf: 'application/pdf',
  txt: 'text/plain',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

/**
 * Import soal dari file APAPUN (pdf, docx, gambar, txt) tanpa ketentuan format.
 * Mengembalikan array soal siap dipakai di ReviewJawabanScreen.
 */
export async function importQuestionsFromAnyFile(fileUri, fileName, declaredMimeType) {
  const ext = (fileName.split('.').pop() || '').toLowerCase()
  const mimeType = declaredMimeType || EXT_MIME[ext] || 'application/octet-stream'

  let payload

  if (ext === 'docx') {
    const text = await extractDocxPlainText(fileUri)
    if (!text.trim()) throw new Error('Tidak ada teks yang bisa dibaca dari file Word ini.')
    payload = { mode: 'text', text }
  } else if (ext === 'txt' || mimeType === 'text/plain') {
    const text = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 })
    if (!text.trim()) throw new Error('File teks kosong.')
    payload = { mode: 'text', text }
  } else if (mimeType === 'application/pdf' || mimeType.startsWith('image/')) {
    const base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 })
    payload = { mode: 'file', mimeType, base64 }
  } else {
    throw new Error('Format file ini belum didukung. Gunakan PDF, Word (.docx), gambar (jpg/png), atau teks (.txt).')
  }

  const { data, error } = await supabase.functions.invoke('parse-exam-file', {
    body: payload,
  })

  if (error) throw new Error(error.message || 'Gagal menghubungi server AI.')
  if (!data?.questions || !Array.isArray(data.questions)) {
    throw new Error('AI tidak mengembalikan format soal yang valid. Coba file lain.')
  }
  if (data.questions.length === 0) {
    throw new Error('AI tidak menemukan soal apapun di file ini.')
  }

  return data.questions.map((q) => ({
    text: q.text || '',
    a: q.a || '',
    b: q.b || '',
    c: q.c || '',
    d: q.d || '',
    e: q.e || '',
    correct: q.correct ? String(q.correct).toLowerCase() : null,
  }))
}
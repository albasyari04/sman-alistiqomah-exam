import JSZip from 'jszip'

const LETTERS = ['a', 'b', 'c', 'd', 'e']

function decodeXmlEntities(str) {
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
}

// Ambil semua <w:p>...</w:p> jadi array {text, numId}
function extractParagraphs(xml) {
  const paraBlocks = xml.match(/<w:p[ >][\s\S]*?<\/w:p>/g) || []

  return paraBlocks.map((block) => {
    const numIdMatch = block.match(/<w:numPr>[\s\S]*?<w:numId w:val="(\d+)"/)
    const numId = numIdMatch ? numIdMatch[1] : null

    const tokenRegex = /<w:t[^>]*>([\s\S]*?)<\/w:t>|<w:tab\/>|<w:br\/>/g
    let text = ''
    let match
    while ((match = tokenRegex.exec(block)) !== null) {
      if (match[1] !== undefined) {
        text += decodeXmlEntities(match[1])
      } else if (match[0] === '<w:tab/>') {
        text += '\t'
      } else if (match[0] === '<w:br/>') {
        text += '\n'
      }
    }

    return { text: text.trim(), numId }
  })
}

// Cari huruf opsi (a-e) yang diketik manual di AWAL paragraf, contoh "a. meter" / "b) massa"
const TYPED_OPTION_REGEX = /^([a-eA-E])[.)]\s*/

// Ambil opsi jawaban dari sekumpulan paragraf "body" (paragraf di antara dua soal).
// Menangani 3 kondisi, bisa campur dalam satu soal:
//   1. Opsi diketik manual dengan huruf ("a. meter") -> huruf dipakai apa adanya.
//   2. Opsi pakai fitur Numbering/List bawaan Word (numId ada, tapi teks TIDAK ada huruf
//      karena hurufnya dirender oleh Word, bukan tersimpan sebagai teks) -> huruf diambil
//      berurutan (a, b, c, d, e) sesuai urutan kemunculan paragraf.
//   3. Paragraf tanpa huruf & tanpa numId (bukan bagian dari daftar opsi) -> diabaikan.
function extractOptionsFromBody(bodyParagraphs) {
  const options = { a: '', b: '', c: '', d: '', e: '' }
  const used = new Set()

  function nextAutoLetter() {
    return LETTERS.find((l) => !used.has(l)) || null
  }

  for (const p of bodyParagraphs) {
    if (!p.text) continue

    const typedMatch = p.text.match(TYPED_OPTION_REGEX)
    let letter = null
    let content = ''

    if (typedMatch) {
      letter = typedMatch[1].toLowerCase()
      content = p.text.slice(typedMatch[0].length).trim()
    } else if (p.numId) {
      // Paragraf ini bagian dari sebuah list (numbering asli Word) tapi tidak ada
      // huruf tertulis -> anggap ini opsi berikutnya secara berurutan.
      letter = nextAutoLetter()
      content = p.text
    } else {
      // Bukan opsi berhuruf & bukan list -> lewati (kemungkinan lanjutan teks soal).
      continue
    }

    if (letter && !used.has(letter) && content !== '') {
      options[letter] = content
      used.add(letter)
    }
  }

  return options
}

// STRATEGI A: nomor soal ditulis manual sebagai teks (contoh: "1. ..." / "1) ...")
function parseByTypedNumbers(paragraphs) {
  const questions = []
  const qStartRegex = /^\d{1,3}[.)]\s*/

  let i = 0
  while (i < paragraphs.length) {
    const p = paragraphs[i]
    if (p.text && qStartRegex.test(p.text)) {
      const stem = p.text.replace(qStartRegex, '').trim()
      let j = i + 1
      while (j < paragraphs.length && !(paragraphs[j].text && qStartRegex.test(paragraphs[j].text))) {
        j++
      }

      const options = extractOptionsFromBody(paragraphs.slice(i + 1, j))

      questions.push({
        text: stem,
        a: options.a,
        b: options.b,
        c: options.c,
        d: options.d,
        e: options.e,
        correct: null,
      })

      i = j
    } else {
      i++
    }
  }
  return questions
}

// STRATEGI B: nomor soal dari fitur "Numbering" Word (soal pakai numId),
// opsi jawaban bisa diketik manual ATAU juga pakai numbering Word sendiri (ditangani
// oleh extractOptionsFromBody).
function parseByWordNumbering(paragraphs) {
  const withNum = paragraphs.filter((p) => p.numId && p.text)
  if (withNum.length === 0) return []

  const freq = {}
  withNum.forEach((p) => { freq[p.numId] = (freq[p.numId] || 0) + 1 })
  const qNumId = Object.keys(freq).reduce((a, b) => (freq[a] > freq[b] ? a : b))

  const questions = []
  let stem = null
  let bodyParas = []

  function flush() {
    if (stem === null) return
    const options = extractOptionsFromBody(bodyParas)
    questions.push({
      text: stem,
      a: options.a,
      b: options.b,
      c: options.c,
      d: options.d,
      e: options.e,
      correct: null,
    })
  }

  paragraphs.forEach((p) => {
    if (!p.text) return
    if (p.numId === qNumId) {
      flush()
      stem = p.text
      bodyParas = []
    } else if (stem !== null) {
      bodyParas.push(p)
    }
  })
  flush()

  return questions
}

// Terima STRING BASE64 dari isi file .docx (bukan file URI), supaya fungsi ini
// tidak bergantung pada cara baca file (yang berbeda antara native & web).
// Pemanggil (screen) bertanggung jawab membaca file jadi base64 sesuai platform.
export async function parseDocxToQuestions(base64) {
  const zip = await JSZip.loadAsync(base64, { base64: true })
  const xmlFile = zip.file('word/document.xml')
  if (!xmlFile) throw new Error('File bukan .docx yang valid')

  const xml = await xmlFile.async('string')
  const paragraphs = extractParagraphs(xml)

  let questions = parseByTypedNumbers(paragraphs)
  if (questions.length < 3) {
    const alt = parseByWordNumbering(paragraphs)
    if (alt.length > questions.length) questions = alt
  }

  return questions
}
import JSZip from 'jszip'
import * as FileSystem from 'expo-file-system/legacy'

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

    // PENTING: "(?:\s[^>]*)?" — bukan "[^>]*" — supaya setelah "w:t" wajib
    // langsung ">" ATAU spasi (baru diikuti atribut). Kalau dibiarkan
    // "[^>]*" longgar, pola ini SALAH ikut mencocokkan "<w:tab/>" sebagai
    // pembuka tag <w:t...> (karena "w:t" + "ab/" + ">" kebetulan cocok pola
    // yang sama). Efeknya regex lalu mencari "</w:t>" penutup berikutnya
    // yang letaknya jauh di depan, dan menelan seluruh XML mentah di antara
    // keduanya sebagai "teks" — inilah sumber bug soal/opsi berisi XML.
    const tokenRegex = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:tab\/>|<w:br\/>/g
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

// STRATEGI A: nomor & huruf ditulis manual sebagai teks (contoh: "1. ..." / "a. ...")
// Sekarang: soal TANPA pilihan jawaban pun tetap dimasukkan (a-e dikosongkan),
// supaya bisa dilengkapi manual di layar Review.
function parseByTypedNumbers(paragraphs) {
  const questions = []
  const qStartRegex = /^\d{1,3}[.)]\s*/
  // 'm' (multiline): huruf opsi harus di awal baris ATAU tepat setelah tab,
  // supaya kata biasa yang kebetulan diakhiri titik (contoh: "...ide
  // barunya.") tidak salah terbaca sebagai opsi "a.". Syarat "setelah tab"
  // ditambahkan supaya format 2 opsi sejajar dalam satu baris (kebiasaan
  // umum saat menulis soal PG di Word, contoh: "a. Usaha [tab] d. Seniman")
  // tetap terpisah dengan benar jadi opsi A dan D masing-masing, bukan
  // ikut menempel jadi satu opsi.
  const optRegex = /(?:^|\t)([a-eA-E])[.)]\s*/gm

  let i = 0
  while (i < paragraphs.length) {
    const p = paragraphs[i]
    if (p.text && qStartRegex.test(p.text)) {
      const stem = p.text.replace(qStartRegex, '').trim()
      let body = ''
      let j = i + 1
      while (j < paragraphs.length && !(paragraphs[j].text && qStartRegex.test(paragraphs[j].text))) {
        body += paragraphs[j].text + '\n'
        j++
      }

      const matches = [...body.matchAll(optRegex)]
      const options = { a: '', b: '', c: '', d: '', e: '' }

      if (matches.length >= 2) {
        for (let k = 0; k < matches.length; k++) {
          const label = matches[k][1].toLowerCase()
          const start = matches[k].index + matches[k][0].length
          const end = k + 1 < matches.length ? matches[k + 1].index : body.length
          options[label] = body.slice(start, end).replace(/[\n\t]+/g, ' ').trim()
        }
      }
      // Kalau matches < 2 (tidak ada pilihan jawaban terdeteksi), options tetap kosong ""
      // tapi soal TETAP dimasukkan, tidak dibuang.

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
// tapi pilihan jawaban (a./b./c./d./e.) diketik manual sebagai teks biasa TANPA numId.
// Jadi: paragraf ber-numId = awal soal baru. Paragraf lain di antaranya = "body"
// yang lalu diparse dengan regex huruf, persis seperti STRATEGI A.
function parseByWordNumbering(paragraphs) {
  const withNum = paragraphs.filter((p) => p.numId && p.text)
  if (withNum.length === 0) return []

  const freq = {}
  withNum.forEach((p) => { freq[p.numId] = (freq[p.numId] || 0) + 1 })
  const qNumId = Object.keys(freq).reduce((a, b) => (freq[a] > freq[b] ? a : b))

  // Sama seperti di parseByTypedNumbers: kenali huruf opsi di awal baris
  // ATAU tepat setelah tab, supaya format 2 opsi sejajar dalam satu baris
  // ("a. Usaha [tab] d. Seniman") tetap terpisah jadi opsi masing-masing.
  const optRegex = /(?:^|\t)([a-eA-E])[.)]\s*/gm
  const questions = []
  let stem = null
  let body = ''

  function flush() {
    if (stem === null) return
    const matches = [...body.matchAll(optRegex)]
    const options = { a: '', b: '', c: '', d: '', e: '' }

    if (matches.length >= 2) {
      for (let k = 0; k < matches.length; k++) {
        const label = matches[k][1].toLowerCase()
        const start = matches[k].index + matches[k][0].length
        const end = k + 1 < matches.length ? matches[k + 1].index : body.length
        options[label] = body.slice(start, end).replace(/[\n\t]+/g, ' ').trim()
      }
    }
    // Kalau matches < 2, options tetap kosong "" tapi soal tetap dimasukkan.

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
      body = ''
    } else if (stem !== null) {
      body += p.text + '\n'
    }
  })
  flush()

  return questions
}

export async function parseDocxToQuestions(fileUri) {
  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  })
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
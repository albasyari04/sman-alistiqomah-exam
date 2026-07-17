const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
const MODEL = 'claude-sonnet-5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `Kamu adalah asisten yang mengekstrak soal pilihan ganda dari dokumen ujian sekolah.
Baca isi dokumen/gambar yang diberikan, lalu ubah setiap soal menjadi objek JSON dengan struktur:
{ "text": "...", "a": "...", "b": "...", "c": "...", "d": "...", "e": "...", "correct": "a" }

Aturan:
- "correct" hanya diisi jika kunci jawaban benar-benar tertulis eksplisit di dokumen (misalnya ditandai tebal, garis bawah, atau ditulis terpisah "Kunci: B"). Jika tidak ada penanda jawaban yang jelas, isi "correct" dengan null.
- Jika sebuah soal hanya punya 4 pilihan (A-D), biarkan "e" menjadi string kosong "".
- Abaikan teks yang bukan bagian dari soal (header sekolah, footer, nomor halaman, instruksi umum ujian).
- Jangan mengarang jawaban benar jika kamu tidak yakin. Lebih baik null daripada salah.

Balas HANYA dengan JSON valid berbentuk: { "questions": [ ... ] }
Jangan tambahkan teks lain, penjelasan, atau markdown code fence apapun.`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY belum diset di Supabase secrets.')
    }

    const body = await req.json()
    const { mode, text, mimeType, base64 } = body

    let userContent
    if (mode === 'text') {
      if (!text || !text.trim()) throw new Error('Teks kosong.')
      userContent = [{ type: 'text', text: `Berikut isi dokumen ujian:\n\n${text}` }]
    } else if (mode === 'file') {
      if (!base64 || !mimeType) throw new Error('File tidak lengkap.')
      if (mimeType === 'application/pdf') {
        userContent = [
          { type: 'document', source: { type: 'base64', media_type: mimeType, data: base64 } },
          { type: 'text', text: 'Ekstrak semua soal dari dokumen di atas.' },
        ]
      } else if (mimeType.startsWith('image/')) {
        userContent = [
          { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64 } },
          { type: 'text', text: 'Ekstrak semua soal dari gambar di atas.' },
        ]
      } else {
        throw new Error('Tipe file tidak didukung.')
      }
    } else {
      throw new Error('Mode tidak dikenali.')
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 8000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userContent }],
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result?.error?.message || 'Gagal memanggil AI.')
    }

    const textBlock = result.content?.find((c: any) => c.type === 'text')
    if (!textBlock) throw new Error('AI tidak mengembalikan teks.')

    let cleaned = textBlock.text.trim()
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```$/, '').trim()

    const parsed = JSON.parse(cleaned)

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
      status: 400,
    })
  }
})
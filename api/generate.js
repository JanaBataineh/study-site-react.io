export const config = {
  maxDuration: 60
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { text, file, files, mode = 'both' } = req.body || {}
    const hasFiles = (Array.isArray(files) && files.length > 0) || (file?.data && file?.mimeType)

    if (!text?.trim() && !hasFiles) {
      return res.status(400).json({ error: 'أدخلي نصاً أو ارفعي ملفاً' })
    }

    const apiKey = (process.env.GEMINI_API_KEY || '').trim()
    if (!apiKey) {
      return res.status(500).json({ error: 'مفتاح GEMINI_API_KEY مفقود من إعدادات Vercel' })
    }

    // استخدام gemini-2.5-flash لأنه سريع جداً ولا يسبب Timeout 500 على Vercel
    const envModel = (process.env.GEMINI_MODEL || '').trim()
    const model = (!envModel || envModel.includes('3.8') || envModel.includes('pro'))
      ? 'gemini-2.5-flash'
      : envModel

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

    const wantCards = mode === 'cards' || mode === 'both'
    const wantQs = mode === 'quiz' || mode === 'both'

    const prompt = `
أنت معلم خبير. من المحتوى المرفق استخرج مادة دراسية بنفس لغة المحتوى.
${wantCards ? '- "cards": بطاقات دراسية (سؤال وجواب مختصر ودقيق) تغطي أهم المفاهيم.' : ''}
${wantQs ? '- "questions": أسئلة اختيار من متعدد، كل سؤال له 4 خيارات، خيار واحد صحيح فقط، والخيارات الخاطئة منطقية. "correct" هو رقم الخيار الصحيح (من 0 إلى 3)، ووزّعي موقع الإجابة الصحيحة بشكل متنوع.' : ''}
أرجع JSON فقط بهذا الشكل بالضبط:
{
  "cards": [{"q": "...", "a": "..."}],
  "questions": [{"q": "...", "options": ["...", "...", "...", "..."], "correct": 0}]
}
اترك المصفوفة غير المطلوبة فارغة. إذا لم يحتوِ المحتوى على معلومات دراسية أرجع مصفوفتين فارغتين.
${text?.trim() ? `\nالنص:\n${text}` : ''}
`

    const parts = []
    if (Array.isArray(files)) {
      for (const f of files) {
        if (f?.data && f?.mimeType) {
          parts.push({ inline_data: { mime_type: f.mimeType, data: f.data } })
        }
      }
    } else if (file?.data && file?.mimeType) {
      parts.push({ inline_data: { mime_type: file.mimeType, data: file.data } })
    }
    parts.push({ text: prompt })

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    })

    const rawResponse = await response.text()
    let data
    try {
      data = JSON.parse(rawResponse)
    } catch {
      return res.status(500).json({ error: `رد غير صالح من جوجل (الحالة ${response.status})` })
    }

    if (data.error) {
      return res.status(500).json({ error: 'خطأ من جوجل: ' + data.error.message })
    }

    const aiOutput = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('')
    if (!aiOutput) {
      return res.status(500).json({ error: 'لم يرجع النموذج أي نتيجة.' })
    }

    let parsed
    try {
      parsed = JSON.parse(aiOutput.replace(/```json|```/g, '').trim())
    } catch {
      return res.status(500).json({ error: 'تعذّر قراءة تنسيق JSON من الذكاء الاصطناعي.' })
    }

    const cards = (parsed.cards || []).filter(c => c?.q && c?.a)
    const questions = (parsed.questions || []).filter(
      q => q?.q && Array.isArray(q.options) && q.options.length >= 2 &&
           Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.options.length
    )

    return res.status(200).json({ cards, questions })
  } catch (error) {
    console.error('Server Error:', error)
    return res.status(500).json({ error: 'حدث خطأ في السيرفر: ' + error.message })
  }
}
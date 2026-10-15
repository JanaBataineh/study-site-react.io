export const config = { maxDuration: 60 } // نموذج pro أبطأ، والافتراضي 10 ثواني بس

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const { text, file, mode = 'both' } = req.body || {}
  if (!text?.trim() && !file) return res.status(400).json({ error: 'أدخلي نصاً أو ارفعي ملفاً' })

  const apiKey = (process.env.GEMINI_API_KEY || '').trim()
  if (!apiKey) return res.status(500).json({ error: 'مفتاح API مفقود من إعدادات Vercel' })

  // اسم النموذج من متغير بيئة، وإلا الافتراضي
  const model = (process.env.GEMINI_MODEL || 'gemini-3.8-pro').trim()
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

  const wantCards = mode === 'cards' || mode === 'both'
  const wantQs = mode === 'quiz' || mode === 'both'

  const prompt = `
أنت معلم خبير. من المحتوى المرفق (نص و/أو ملف) استخرج مادة دراسية بنفس لغة المحتوى.
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
  if (file?.data && file?.mimeType) {
    parts.push({ inline_data: { mime_type: file.mimeType, data: file.data } })
  }
  parts.push({ text: prompt })

  try {
    let response, data
    for (let attempt = 0; attempt < 3; attempt++) {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      })
      data = await response.json()
      if (response.status !== 503 && response.status !== 429) break
      await new Promise(r => setTimeout(r, 1500 * (attempt + 1)))
    }

    if (data.error) {
      console.error('Google API Error:', data.error)
      return res.status(500).json({ error: 'خطأ من جوجل: ' + data.error.message })
    }

    const aiOutput = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('')
    if (!aiOutput) return res.status(500).json({ error: 'جوجل لم يرجع أي نتيجة.' })

    let parsed
    try {
      parsed = JSON.parse(aiOutput.replace(/```json|```/g, '').trim())
    } catch {
      return res.status(500).json({ error: 'تعذّر قراءة رد الذكاء الاصطناعي، جربي مرة ثانية.' })
    }

    const cards = (parsed.cards || []).filter(c => c?.q && c?.a)
    const questions = (parsed.questions || []).filter(
      q => q?.q && Array.isArray(q.options) && q.options.length >= 2 &&
           Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.options.length
    )
    res.status(200).json({ cards, questions })
  } catch (error) {
    console.error('Server Error:', error)
    res.status(500).json({ error: 'حدث خطأ في السيرفر: ' + error.message })
  }
}export const config = { maxDuration: 60 } // نموذج pro أبطأ، والافتراضي 10 ثواني بس

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const { text, file, mode = 'both' } = req.body || {}
  if (!text?.trim() && !file) return res.status(400).json({ error: 'أدخلي نصاً أو ارفعي ملفاً' })

  const apiKey = (process.env.GEMINI_API_KEY || '').trim()
  if (!apiKey) return res.status(500).json({ error: 'مفتاح API مفقود من إعدادات Vercel' })

  // اسم النموذج من متغير بيئة، وإلا الافتراضي
  const model = (process.env.GEMINI_MODEL || 'gemini-3.8-pro').trim()
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

  const wantCards = mode === 'cards' || mode === 'both'
  const wantQs = mode === 'quiz' || mode === 'both'

  const prompt = `
أنت معلم خبير. من المحتوى المرفق (نص و/أو ملف) استخرج مادة دراسية بنفس لغة المحتوى.
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
  if (file?.data && file?.mimeType) {
    parts.push({ inline_data: { mime_type: file.mimeType, data: file.data } })
  }
  parts.push({ text: prompt })

  try {
    let response, data
    for (let attempt = 0; attempt < 3; attempt++) {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      })
      data = await response.json()
      if (response.status !== 503 && response.status !== 429) break
      await new Promise(r => setTimeout(r, 1500 * (attempt + 1)))
    }

    if (data.error) {
      console.error('Google API Error:', data.error)
      return res.status(500).json({ error: 'خطأ من جوجل: ' + data.error.message })
    }

    const aiOutput = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('')
    if (!aiOutput) return res.status(500).json({ error: 'جوجل لم يرجع أي نتيجة.' })

    let parsed
    try {
      parsed = JSON.parse(aiOutput.replace(/```json|```/g, '').trim())
    } catch {
      return res.status(500).json({ error: 'تعذّر قراءة رد الذكاء الاصطناعي، جربي مرة ثانية.' })
    }

    const cards = (parsed.cards || []).filter(c => c?.q && c?.a)
    const questions = (parsed.questions || []).filter(
      q => q?.q && Array.isArray(q.options) && q.options.length >= 2 &&
           Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.options.length
    )
    res.status(200).json({ cards, questions })
  } catch (error) {
    console.error('Server Error:', error)
    res.status(500).json({ error: 'حدث خطأ في السيرفر: ' + error.message })
  }
}
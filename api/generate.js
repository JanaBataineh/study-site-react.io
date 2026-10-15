export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })
  
  const { text } = req.body
  if (!text) return res.status(400).json({ error: 'النص مطلوب' })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'مفتاح API مفقود من إعدادات Vercel' })

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

  const prompt = `
  أنت معلم خبير. اقرأ النص التالي واستخرج منه بطاقات دراسية (سؤال وجواب) تلخص أهم النقاط.
  يجب أن يكون الرد بصيغة JSON فقط، عبارة عن مصفوفة (Array) تحتوي على كائنات، كل كائن فيه "q" للسؤال و "a" للجواب.
  لا تكتب أي نص إضافي أو شروحات قبل أو بعد الـ JSON.
  
  النص:
  ${text}
  `

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    })
    
    const data = await response.json()
    
    // التحقق من وجود خطأ من جوجل (مثل مفتاح غير صالح)
    if (data.error) {
      console.error("Google API Error:", data.error)
      return res.status(500).json({ error: 'خطأ من جوجل: ' + data.error.message })
    }

    // التحقق من نجاح توليد النص
    if (!data.candidates || !data.candidates[0]) {
      return res.status(500).json({ error: 'جوجل لم يرجع أي نتيجة.' })
    }

    const aiOutput = data.candidates[0].content.parts[0].text
    
    const cleanJson = aiOutput.replace(/```json/g, '').replace(/```/g, '').trim()
    const generatedCards = JSON.parse(cleanJson)
    
    res.status(200).json({ cards: generatedCards })
  } catch (error) {
    console.error("Server Error:", error)
    res.status(500).json({ error: 'حدث خطأ أثناء المعالجة: ' + error.message })
  }
}
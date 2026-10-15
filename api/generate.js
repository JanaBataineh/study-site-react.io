export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })
  
  const { text } = req.body
  if (!text) return res.status(400).json({ error: 'النص مطلوب' })

  // تنظيف المفتاح من المسافات
  const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : ''
  if (!apiKey) return res.status(500).json({ error: 'مفتاح API مفقود من إعدادات Vercel' })

  // استخدام النموذج الجديد المعتمد من جوجل gemini-2.5-flash
const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`
  const prompt = `
  أنت معلم خبير. استخرج بطاقات دراسية (سؤال وجواب) من النص التالي.
  مهم جداً: يجب أن يكون الرد بصيغة JSON فقط بهذا الشكل بالضبط بدون أي نصوص أخرى:
  [
    {"q": "السؤال الأول؟", "a": "الجواب الأول."},
    {"q": "السؤال الثاني؟", "a": "الجواب الثاني."}
  ]
  إذا لم يكن النص مفهوماً أو لا يحتوي على معلومات دراسية، أرجع مصفوفة فارغة هكذا: []
  
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
    
    if (data.error) {
      console.error("Google API Error:", data.error)
      return res.status(500).json({ error: 'خطأ من جوجل: ' + data.error.message })
    }

    if (!data.candidates || !data.candidates[0]) {
      return res.status(500).json({ error: 'جوجل لم يرجع أي نتيجة.' })
    }

    const aiOutput = data.candidates[0].content.parts[0].text
    
    try {
      // محاولة قراءة النص كـ JSON
      const cleanJson = aiOutput.replace(/```json/g, '').replace(/```/g, '').trim()
      const generatedCards = JSON.parse(cleanJson)
      res.status(200).json({ cards: generatedCards })
    } catch (parseError) {
      res.status(500).json({ error: 'لم يتمكن الذكاء الاصطناعي من استخراج بطاقات من هذا النص. يرجى تجربة نص دراسي واضح.' })
    }
  } catch (error) {
    console.error("Server Error:", error)
    res.status(500).json({ error: 'حدث خطأ في السيرفر: ' + error.message })
  }
}
import { useState } from 'react'
import { uid } from '../useStorage.js'

const emptyQ = { q: '', options: ['', '', '', ''], correct: 0 }
const MAX_RAW_FILE = 50 * 1024 * 1024 // 50MB

const compressImage = (file, maxWidth = 1300, quality = 0.65) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      const dataUrl = canvas.toDataURL('image/jpeg', quality)
      resolve({
        name: file.name,
        mimeType: 'image/jpeg',
        data: dataUrl.split(',')[1]
      })
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

const processPdfFile = async (file, onProgress) => {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let fullText = ''

  for (let i = 1; i <= pdf.numPages; i++) {
    onProgress(`جاري قراءة صفحة ${i} من ${pdf.numPages}...`)
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items.map((item) => item.str).join(' ')
    if (pageText.trim()) {
      fullText += `\n--- صفحة ${i} ---\n` + pageText
    }
  }

  if (fullText.trim().length > 100) {
    return { type: 'text', text: fullText.trim(), numPages: pdf.numPages }
  }

  // إذا كان الملف مصوّراً (Scanned PDF مثل كتب مكتبة نور) نحول أول 12 صفحة إلى صور مضغوطة
  const maxPagesToRender = Math.min(pdf.numPages, 12)
  const pageImages = []

  for (let i = 1; i <= maxPagesToRender; i++) {
    onProgress(`ملف مصوّر: جاري تجهيز الصفحة ${i} من ${maxPagesToRender}...`)
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 1.15 })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')
    await page.render({ canvasContext: ctx, viewport }).promise
    const dataUrl = canvas.toDataURL('image/jpeg', 0.6)
    pageImages.push({
      mimeType: 'image/jpeg',
      data: dataUrl.split(',')[1]
    })
  }

  return { type: 'images', images: pageImages, numPages: pdf.numPages, rendered: maxPagesToRender }
}

export default function Manage({ activeSub, cards, setCards, questions, setQuestions, currentCards, currentQs }) {
  const [cardForm, setCardForm] = useState({ q: '', a: '' })
  const [qForm, setQForm] = useState(emptyQ)
  const [msg, setMsg] = useState('')

  const [editingCard, setEditingCard] = useState(null)
  const [editingQ, setEditingQ] = useState(null)

  const [aiText, setAiText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [fileStatus, setFileStatus] = useState('')
  const [aiFiles, setAiFiles] = useState([])
  const [aiMode, setAiMode] = useState('both')

  const [jsonInput, setJsonInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [chapterName, setChapterName] = useState('')
  const [uploadType, setUploadType] = useState('material')

  const promptText = uploadType === 'both'
    ? `أنت خبير تعليمي دقيق جداً. أرفقت لك ملفين (ملف شرح المادة + ملف بنك أسئلة).
مهمتك هي البحث داخل بنك الأسئلة عن كل ما يخص موضوع: [${chapterName || 'اسم الشابتر'}] واستخراج كل الأسئلة والإجابات الخاصة به.
استعن بملف المادة فقط إذا احتجت لفهم سياق سؤال معين.
تحذير صارم: يجب أن تكون الإجابات والأسئلة مأخوذة حصرياً وبشكل صارم من الملفات المرفقة. لا تقم بتأليف أو إضافة أي معلومة نهائياً.
ملاحظة للغة: حافظ على لغة المستند الأصلية دون ترجمة المصطلحات التقنية.

أرجع النتيجة فقط وحصرياً بصيغة JSON بدون أي نصوص أخرى.
الهيكلة المطلوبة:
{
  "cards": [ {"q": "السؤال هنا", "a": "الجواب الدقيق هنا"} ],
  "questions": [
    { "q": "السؤال", "options": ["1", "2", "3", "4"], "correct": 0 }
  ]
}`
    : `أنت خبير تعليمي دقيق جداً. أرفقت لك ملف المادة.
مهمتك قراءة موضوع: [${chapterName || 'اسم الشابتر'}] من المستند واستخراج كل المعلومات منه بلا استثناء (تفاصيل، تعريفات، مقارنات).
تحذير صارم: اعتمد حصرياً وبشكل صارم على محتوى المستند فقط دون إضافة أي معلومة من خارج المستند نهائياً. لا تختصر التفاصيل.
ملاحظة للغة: حافظ على لغة المستند الأصلية دون ترجمة المصطلحات التقنية.

أرجع النتيجة فقط وحصرياً بصيغة JSON بدون أي نصوص أخرى.
الهيكلة المطلوبة:
{
  "cards": [ {"q": "السؤال هنا", "a": "الجواب الدقيق هنا"} ],
  "questions": [
    { "q": "السؤال", "options": ["1", "2", "3", "4"], "correct": 0 }
  ]
}`

  const copyPrompt = (e) => {
    e.preventDefault()
    navigator.clipboard.writeText(promptText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const addCard = (e) => {
    e.preventDefault()
    if (!cardForm.q.trim() || !cardForm.a.trim()) return
    setCards([...cards, { id: uid(), subjectId: activeSub, q: cardForm.q.trim(), a: cardForm.a.trim() }])
    setCardForm({ q: '', a: '' })
  }

  const updateCard = (e) => {
    e.preventDefault()
    if (!editingCard.q.trim() || !editingCard.a.trim()) return
    setCards(cards.map(c => c.id === editingCard.id ? { ...editingCard, q: editingCard.q.trim(), a: editingCard.a.trim() } : c))
    setEditingCard(null)
  }

  const addQuestion = (e) => {
    e.preventDefault()
    const filled = qForm.options.map((text, i) => ({ text: text.trim(), i })).filter((o) => o.text)
    const correctPos = filled.findIndex((o) => o.i === qForm.correct)

    if (!qForm.q.trim() || filled.length < 2 || correctPos === -1) {
      setMsg('اكتب السؤال وخيارين على الأقل، وتأكد إن الخيار الصحيح مكتوب.')
      return
    }
    setMsg('')
    setQuestions([...questions, { id: uid(), subjectId: activeSub, q: qForm.q.trim(), options: filled.map((o) => o.text), correct: correctPos }])
    setQForm(emptyQ)
  }

  const updateQuestion = (e) => {
    e.preventDefault()
    const filled = editingQ.options.map((text, i) => ({ text: text.trim(), i })).filter((o) => o.text)
    const correctPos = filled.findIndex((o) => o.i === editingQ.correct)

    if (!editingQ.q.trim() || filled.length < 2 || correctPos === -1) {
      alert('اكتب السؤال وخيارين على الأقل، وتأكد إن الخيار الصحيح مكتوب.')
      return
    }

    setQuestions(questions.map(q => q.id === editingQ.id ? { id: editingQ.id, subjectId: activeSub, q: editingQ.q.trim(), options: filled.map(o => o.text), correct: correctPos } : q))
    setEditingQ(null)
  }

  const setOption = (i, value) => {
    const options = [...qForm.options]; options[i] = value; setQForm({ ...qForm, options })
  }
  const setEditOption = (i, value) => {
    const options = [...editingQ.options]; options[i] = value; setEditingQ({ ...editingQ, options })
  }
  const openEditQ = (q) => {
    const newOptions = ['', '', '', '']; q.options.forEach((opt, i) => { if (i < 4) newOptions[i] = opt }); setEditingQ({ ...q, options: newOptions })
  }

  const pickFile = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > MAX_RAW_FILE) {
      alert('حجم الملف يتجاوز 50 ميغابايت.')
      e.target.value = ''
      return
    }

    setFileStatus('جاري معالجة الملف... ⏳')

    try {
      if (f.type.startsWith('text/') || /\.(txt|md)$/i.test(f.name)) {
        const content = await f.text()
        setAiText(prev => (prev ? prev + '\n\n' : '') + content)
        setAiFiles([])
        setFileStatus(`✅ تم استخراج النص من ${f.name}`)
        e.target.value = ''
        return
      }

      if (f.type === 'application/pdf' || /\.pdf$/i.test(f.name)) {
        if (!window.pdfjsLib) {
          alert('يرجى تحديث الصفحة (Ctrl + F5) لتفعيل قارئ ملفات الـ PDF.')
          setFileStatus('')
          return
        }
        const result = await processPdfFile(f, setFileStatus)
        if (result.type === 'text') {
          setAiText(prev => (prev ? prev + '\n\n' : '') + result.text)
          setAiFiles([])
          setFileStatus(`✅ تم استخراج النص من ${f.name} (${result.numPages} صفحة)`)
        } else {
          setAiFiles(result.images)
          const note = result.numPages > result.rendered ? ` (أول ${result.rendered} صفحة)` : ` (${result.rendered} صفحة)`
          setFileStatus(`📸 تم تجهيز الملف المصوّر: ${f.name}${note}`)
        }
        e.target.value = ''
        return
      }

      if (f.type.startsWith('image/')) {
        const compressed = await compressImage(f)
        setAiFiles([{ mimeType: compressed.mimeType, data: compressed.data }])
        setFileStatus(`🖼️ تم ضغط وإرفاق الصورة: ${f.name}`)
        e.target.value = ''
        return
      }

      alert('الصيغ المدعومة: PDF، صور، txt، md.')
      setFileStatus('')
    } catch (err) {
      console.error(err)
      alert('تعذّر قراءة الملف، تأكدي أنه غير تالف.')
      setFileStatus('')
    }
    e.target.value = ''
  }

  const generateWithAI = async (e) => {
    e.preventDefault()
    if (!aiText.trim() && aiFiles.length === 0) {
      alert('أدخلي نصاً أو ارفعي ملفاً أولاً')
      return
    }

    setIsGenerating(true)
    try {
      let allNewCards = []
      let allNewQs = []

      if (aiFiles.length > 0) {
        const BATCH_SIZE = 2
        const totalBatches = Math.ceil(aiFiles.length / BATCH_SIZE)

        for (let b = 0; b < totalBatches; b++) {
          setFileStatus(`جاري التوليد بالذكاء الاصطناعي (الجزء ${b + 1} من ${totalBatches})... ⏳`)
          const batchFiles = aiFiles.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE)

          const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: b === 0 ? aiText : '',
              mode: aiMode,
              files: batchFiles
            })
          })

          const raw = await res.text()
          let data
          try {
            data = JSON.parse(raw)
          } catch {
            throw new Error(`خطأ من الخادم (${res.status}): تأكدي من رفع التحديث الجديد لملف api/generate.js على Vercel.`)
          }

          if (!res.ok || data.error) {
            throw new Error(data.error || 'حدث خطأ أثناء التوليد')
          }

          const batchCards = (data.cards || []).map(c => ({ id: uid(), subjectId: activeSub, q: c.q, a: c.a }))
          const batchQs = (data.questions || []).map(q => ({
            id: uid(), subjectId: activeSub, q: q.q, options: q.options, correct: q.correct
          }))

          allNewCards.push(...batchCards)
          allNewQs.push(...batchQs)
        }
      } else {
        const CHUNK_SIZE = 30000
        const cleanText = aiText.trim()
        const textChunks = []
        for (let i = 0; i < cleanText.length; i += CHUNK_SIZE) {
          textChunks.push(cleanText.slice(i, i + CHUNK_SIZE))
        }

        for (let idx = 0; idx < textChunks.length; idx++) {
          if (textChunks.length > 1) {
            setFileStatus(`جاري توليد الأسئلة (الجزء ${idx + 1} من ${textChunks.length})... ⏳`)
          }

          const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: textChunks[idx],
              mode: aiMode
            })
          })

          const raw = await res.text()
          let data
          try {
            data = JSON.parse(raw)
          } catch {
            throw new Error(`خطأ من الخادم (${res.status}): تأكدي من رفع التحديث الجديد لملف api/generate.js على Vercel.`)
          }

          if (!res.ok || data.error) {
            throw new Error(data.error || 'حدث خطأ في التوليد')
          }

          const batchCards = (data.cards || []).map(c => ({ id: uid(), subjectId: activeSub, q: c.q, a: c.a }))
          const batchQs = (data.questions || []).map(q => ({
            id: uid(), subjectId: activeSub, q: q.q, options: q.options, correct: q.correct
          }))

          allNewCards.push(...batchCards)
          allNewQs.push(...batchQs)
        }
      }

      if (!allNewCards.length && !allNewQs.length) {
        alert('لم يتم استخراج أسئلة، جربي محتوى أوضح.')
        return
      }

      setCards([...cards, ...allNewCards])
      setQuestions([...questions, ...allNewQs])
      setAiText('')
      setAiFiles([])
      setFileStatus('')
      alert(`تمت إضافة ${allNewCards.length} بطاقة و ${allNewQs.length} سؤال بنجاح 🪄`)
    } catch (err) {
      alert(err.message || 'فشل الاتصال بالخادم')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleImportJson = (e) => {
    e.preventDefault()
    if (!jsonInput.trim()) return

    try {
      const cleanText = jsonInput.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(cleanText)

      let importedCards = []
      let importedQs = []

      if (parsed.cards && Array.isArray(parsed.cards)) {
        importedCards = parsed.cards.map(c => ({
          id: uid(),
          subjectId: activeSub,
          q: c.q,
          a: c.a
        }))
      }

      if (parsed.questions && Array.isArray(parsed.questions)) {
        importedQs = parsed.questions.map(q => ({
          id: uid(),
          subjectId: activeSub,
          q: q.q,
          options: q.options,
          correct: q.correct
        }))
      }

      if (importedCards.length === 0 && importedQs.length === 0) {
        alert('لم يتم العثور على بطاقات أو أسئلة في الكود.')
        return
      }

      setCards([...cards, ...importedCards])
      setQuestions([...questions, ...importedQs])
      setJsonInput('')
      alert(`تمت الإضافة بنجاح! 🚀\n(${importedCards.length} بطاقة، و ${importedQs.length} سؤال)`)
    } catch (err) {
      alert('خطأ في تنسيق الكود! تأكدي أنك نسختي الـ JSON بشكل صحيح وبدون أي كلام إضافي.')
    }
  }

  return (
    <section className="manage">
      <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '12px', border: '1px solid #bbf7d0', marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 12px 0', color: '#166534' }}>✨ توليد بطاقات وأسئلة بالذكاء الاصطناعي</h2>
        <form onSubmit={generateWithAI}>
          <textarea
            placeholder="الصقي النص هنا، أو ارفعي ملفاً كبيراً (PDF، صور، TXT)..."
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            style={{ minHeight: '100px', borderColor: '#86efac' }}
          />
          <input type="file" accept=".pdf,.txt,.md,image/*" onChange={pickFile} />
          {fileStatus && <p className="muted" style={{ color: '#166534', fontWeight: 'bold' }}>{fileStatus}</p>}

          <select
            value={aiMode}
            onChange={(e) => setAiMode(e.target.value)}
            style={{ font: 'inherit', padding: 10, borderRadius: 10, border: '1px solid #86efac' }}
          >
            <option value="both">بطاقات + أسئلة اختبار</option>
            <option value="cards">بطاقات فقط</option>
            <option value="quiz">أسئلة اختبار فقط</option>
          </select>

          <div className="row" style={{ justifyContent: 'flex-start' }}>
            <button className="primary" type="submit" disabled={isGenerating}
              style={{ background: '#16a34a', borderColor: '#16a34a' }}>
              {isGenerating ? 'جاري التوليد... ⏳' : 'توليد'}
            </button>
          </div>
        </form>
      </div>

      <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '3px solid #cbd5e1', marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 16px 0', color: '#334155' }}>📥 استيراد البطاقات من الذكاء الاصطناعي</h2>
{/* إعدادات الأمر السحري */}
        <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '12px', border: '2px dashed #f59e0b', marginBottom: '20px', textAlign: 'start' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#d97706', fontSize: '18px' }}>⚙️ تخصيص الأمر السحري</h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#451a03' }}>1. ماذا سترفع للذكاء الاصطناعي؟</label>
            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{ cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="uploadType" 
                  checked={uploadType === 'material'} 
                  onChange={() => setUploadType('material')} 
                  style={{ marginLeft: '8px' }} 
                />
                ملف المادة فقط
              </label>
              <label style={{ cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="uploadType" 
                  checked={uploadType === 'both'} 
                  onChange={() => setUploadType('both')} 
                  style={{ marginLeft: '8px' }} 
                />
                ملف المادة + بنك أسئلة
              </label>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#451a03' }}>2. ما هو الشابتر الذي تدرسه؟ (اختياري)</label>
            <input 
              type="text" 
              placeholder="مثال: Bacterial Motility أو Chapter 4" 
              value={chapterName}
              onChange={(e) => setChapterName(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
            />
          </div>

          <div style={{ background: '#fff', border: '2px solid #fcd34d', borderRadius: '12px', padding: '12px', position: 'relative' }}>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', whiteSpace: 'pre-wrap', color: '#333', fontFamily: 'monospace', direction: 'rtl', unicodeBidi: 'plaintext', textAlign: 'right' }}>{promptText}</p>
            <button onClick={copyPrompt} style={{ background: copied ? '#10b981' : '#f59e0b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}>
              {copied ? '✅ تم النسخ بنجاح!' : '📋 نسخ الأمر السحري'}
            </button>
          </div>
        </div>
        
        <form onSubmit={handleImportJson}>
          <textarea
            placeholder="الصقي كود الـ JSON الناتج هنا..."
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            style={{ minHeight: '150px', width: '100%', padding: '12px', borderRadius: '8px', borderColor: '#94a3b8', direction: 'ltr', fontFamily: 'monospace', marginBottom: '12px' }}
          />
          <div className="row" style={{ justifyContent: 'flex-start' }}>
            <button className="primary" type="submit" style={{ background: '#475569', borderColor: '#334155', color: '#fff', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
              🚀 استيراد البيانات الآن
            </button>
          </div>
        </form>
      </div>

      <h2>إضافة بطاقة يدوياً</h2>
      <form onSubmit={addCard}>
        <input placeholder="السؤال" value={cardForm.q} onChange={(e) => setCardForm({ ...cardForm, q: e.target.value })} />
        <textarea placeholder="الجواب" value={cardForm.a} onChange={(e) => setCardForm({ ...cardForm, a: e.target.value })} />
        <div className="row" style={{ justifyContent: 'flex-start' }}><button className="primary" type="submit">إضافة</button></div>
      </form>

      <ul className="items">
        {currentCards.map((c, index) => (
          <li key={c.id}>
            <span>{index + 1}. {c.q}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setEditingCard(c)}>تعديل</button>
              <button className="danger" onClick={() => setCards(cards.filter((x) => x.id !== c.id))}>حذف</button>
            </div>
          </li>
        ))}
      </ul>

      <h2>إضافة سؤال اختبار</h2>
      <form onSubmit={addQuestion}>
        <input placeholder="السؤال" value={qForm.q} onChange={(e) => setQForm({ ...qForm, q: e.target.value })} />
        {qForm.options.map((opt, i) => (
          <label key={i} className="opt-row">
            <input type="radio" name="correct" checked={qForm.correct === i} onChange={() => setQForm({ ...qForm, correct: i })} />
            <input placeholder={`الخيار ${i + 1}`} value={opt} onChange={(e) => setOption(i, e.target.value)} />
          </label>
        ))}
        <p className="muted">حدد الدائرة بجانب الخيار الصحيح</p>
        <div className="row" style={{ justifyContent: 'flex-start' }}><button className="primary" type="submit">إضافة</button></div>
      </form>

      <ul className="items">
        {currentQs.map((q, index) => (
          <li key={q.id}>
            <span>{index + 1}. {q.q}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => openEditQ(q)}>تعديل</button>
              <button className="danger" onClick={() => setQuestions(questions.filter((x) => x.id !== q.id))}>حذف</button>
            </div>
          </li>
        ))}
      </ul>
      {msg && <p className="muted">{msg}</p>}

      {editingCard && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>تعديل البطاقة</h3>
            <form onSubmit={updateCard}>
              <input placeholder="السؤال" value={editingCard.q} onChange={(e) => setEditingCard({ ...editingCard, q: e.target.value })} />
              <textarea placeholder="الجواب" value={editingCard.a} onChange={(e) => setEditingCard({ ...editingCard, a: e.target.value })} />
              <div className="modal-actions">
                <button type="button" onClick={() => setEditingCard(null)}>إلغاء</button>
                <button className="primary" type="submit">حفظ التعديل</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingQ && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>تعديل السؤال</h3>
            <form onSubmit={updateQuestion}>
              <input placeholder="السؤال" value={editingQ.q} onChange={(e) => setEditingQ({ ...editingQ, q: e.target.value })} />
              {editingQ.options.map((opt, i) => (
                <label key={i} className="opt-row">
                  <input type="radio" name="editCorrect" checked={editingQ.correct === i} onChange={() => setEditingQ({ ...editingQ, correct: i })} />
                  <input placeholder={`الخيار ${i + 1}`} value={opt} onChange={(e) => setEditOption(i, e.target.value)} />
                </label>
              ))}
              <div className="modal-actions">
                <button type="button" onClick={() => setEditingQ(null)}>إلغاء</button>
                <button className="primary" type="submit">حفظ التعديل</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
import { useState } from 'react'
import { uid } from '../useStorage.js'
import { defaultCards, defaultQuestions } from '../defaults.js'

const emptyQ = { q: '', options: ['', '', '', ''], correct: 0 }

export default function Manage({ cards, setCards, questions, setQuestions }) {
  const [cardForm, setCardForm] = useState({ q: '', a: '' })
  const [qForm, setQForm] = useState(emptyQ)
  const [msg, setMsg] = useState('')

  // حالات جديدة لتتبع العنصر الذي يتم تعديله
  const [editCardId, setEditCardId] = useState(null)
  const [editQId, setEditQId] = useState(null)

  // دالة الحفظ (تستخدم للإضافة والتعديل معاً)
  const saveCard = (e) => {
    e.preventDefault()
    if (!cardForm.q.trim() || !cardForm.a.trim()) return

    if (editCardId) {
      // إذا كنا في وضع التعديل، نحدث البطاقة المطلوبة فقط
      setCards(cards.map(c => c.id === editCardId ? { ...c, q: cardForm.q.trim(), a: cardForm.a.trim() } : c))
      setEditCardId(null)
    } else {
      // إضافة بطاقة جديدة
      setCards([...cards, { id: uid(), q: cardForm.q.trim(), a: cardForm.a.trim() }])
    }
    setCardForm({ q: '', a: '' })
  }

  // دالة نقل بيانات البطاقة إلى الفورم للتعديل
  const editCard = (c) => {
    setEditCardId(c.id)
    setCardForm({ q: c.q, a: c.a })
  }

  // دالة حفظ السؤال (تستخدم للإضافة والتعديل معاً)
  const saveQuestion = (e) => {
    e.preventDefault()
    const filled = qForm.options
      .map((text, i) => ({ text: text.trim(), i }))
      .filter((o) => o.text)
    const correctPos = filled.findIndex((o) => o.i === qForm.correct)
    
    if (!qForm.q.trim() || filled.length < 2 || correctPos === -1) {
      setMsg('اكتب السؤال وخيارين على الأقل، وتأكد إن الخيار الصحيح مكتوب.')
      return
    }
    setMsg('')

    if (editQId) {
      // تعديل السؤال
      setQuestions(questions.map(q => q.id === editQId ? { id: editQId, q: qForm.q.trim(), options: filled.map((o) => o.text), correct: correctPos } : q))
      setEditQId(null)
    } else {
      // إضافة سؤال جديد
      setQuestions([
        ...questions,
        { id: uid(), q: qForm.q.trim(), options: filled.map((o) => o.text), correct: correctPos }
      ])
    }
    setQForm(emptyQ)
  }

  // دالة نقل بيانات السؤال إلى الفورم للتعديل
  const editQuestion = (q) => {
    setEditQId(q.id)
    // نعيد تعبئة الخيارات الـ 4 حتى لو كان السؤال بخيارين فقط
    const newOptions = ['', '', '', '']
    q.options.forEach((opt, i) => { if (i < 4) newOptions[i] = opt })
    setQForm({ q: q.q, options: newOptions, correct: q.correct })
  }

  const setOption = (i, value) => {
    const options = [...qForm.options]
    options[i] = value
    setQForm({ ...qForm, options })
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ cards, questions }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'study-data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        if (!Array.isArray(data.cards) || !Array.isArray(data.questions)) throw new Error()
        setCards(data.cards)
        setQuestions(data.questions)
        setMsg('تم الاستيراد بنجاح.')
      } catch {
        setMsg('الملف غير صالح.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const resetAll = () => {
    if (!window.confirm('راح تُحذف كل بياناتك وترجع للبيانات المبدئية. متأكد؟')) return
    setCards(defaultCards)
    setQuestions(defaultQuestions)
  }

  return (
    <section className="manage">
      <h2>{editCardId ? 'تعديل البطاقة' : 'إضافة بطاقة'}</h2>
      <form onSubmit={saveCard}>
        <input placeholder="السؤال" value={cardForm.q} onChange={(e) => setCardForm({ ...cardForm, q: e.target.value })} />
        <textarea placeholder="الجواب" value={cardForm.a} onChange={(e) => setCardForm({ ...cardForm, a: e.target.value })} />
        <div className="row" style={{ justifyContent: 'flex-start' }}>
          <button className="primary" type="submit">{editCardId ? 'حفظ التعديل' : 'إضافة'}</button>
          {editCardId && (
            <button type="button" onClick={() => { setEditCardId(null); setCardForm({ q: '', a: '' }) }}>إلغاء</button>
          )}
        </div>
      </form>
      <ul className="items">
        {cards.map((c) => (
          <li key={c.id}>
            <span>{c.q}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => editCard(c)}>تعديل</button>
              <button className="danger" onClick={() => setCards(cards.filter((x) => x.id !== c.id))}>حذف</button>
            </div>
          </li>
        ))}
      </ul>

      <h2>{editQId ? 'تعديل السؤال' : 'إضافة سؤال اختيار من متعدد'}</h2>
      <form onSubmit={saveQuestion}>
        <input placeholder="السؤال" value={qForm.q} onChange={(e) => setQForm({ ...qForm, q: e.target.value })} />
        {qForm.options.map((opt, i) => (
          <label key={i} className="opt-row">
            <input type="radio" name="correct" checked={qForm.correct === i} onChange={() => setQForm({ ...qForm, correct: i })} />
            <input placeholder={`الخيار ${i + 1}`} value={opt} onChange={(e) => setOption(i, e.target.value)} />
          </label>
        ))}
        <p className="muted">حدد الدائرة بجانب الخيار الصحيح</p>
        <div className="row" style={{ justifyContent: 'flex-start' }}>
          <button className="primary" type="submit">{editQId ? 'حفظ التعديل' : 'إضافة'}</button>
          {editQId && (
            <button type="button" onClick={() => { setEditQId(null); setQForm(emptyQ) }}>إلغاء</button>
          )}
        </div>
      </form>
      <ul className="items">
        {questions.map((q) => (
          <li key={q.id}>
            <span>{q.q}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => editQuestion(q)}>تعديل</button>
              <button className="danger" onClick={() => setQuestions(questions.filter((x) => x.id !== q.id))}>حذف</button>
            </div>
          </li>
        ))}
      </ul>

      <h2>نسخ احتياطي</h2>
      <div className="row">
        <button onClick={exportData}>تصدير JSON</button>
        <label className="file-btn">
          استيراد JSON
          <input type="file" accept="application/json" onChange={importData} hidden />
        </label>
        <button className="danger" onClick={resetAll}>إعادة ضبط</button>
      </div>
      {msg && <p className="muted">{msg}</p>}
    </section>
  )
}
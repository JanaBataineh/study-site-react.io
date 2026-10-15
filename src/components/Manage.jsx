import { useState } from 'react'
import { uid } from '../useStorage.js'

const emptyQ = { q: '', options: ['', '', '', ''], correct: 0 }

export default function Manage({ activeSub, cards, setCards, questions, setQuestions, currentCards, currentQs }) {
  const [cardForm, setCardForm] = useState({ q: '', a: '' })
  const [qForm, setQForm] = useState(emptyQ)
  const [msg, setMsg] = useState('')

  const [editingCard, setEditingCard] = useState(null)
  const [editingQ, setEditingQ] = useState(null)

  const addCard = (e) => {
    e.preventDefault()
    if (!cardForm.q.trim() || !cardForm.a.trim()) return
    // الإضافة تتم مباشرة للقسم المفتوح
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

  return (
    <section className="manage">
      <h2>إضافة بطاقة</h2>
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

      {/* الشاشات المنبثقة للتعديل */}
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
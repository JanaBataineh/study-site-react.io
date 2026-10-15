import { useState } from 'react'
import { useStorage, uid } from './useStorage.js'
import { defaultCards, defaultQuestions, defaultSubjects } from './defaults.js'
import Flashcards from './components/Flashcards.jsx'
import Quiz from './components/Quiz.jsx'
import Manage from './components/Manage.jsx'

const TABS = [['cards', 'البطاقات'], ['quiz', 'الاختبار'], ['manage', 'إدارة المحتوى']]

export default function App() {
  const [subjects, setSubjects] = useStorage('study:subjects', defaultSubjects)
  const [cards, setCards] = useStorage('study:cards', defaultCards)
  const [questions, setQuestions] = useStorage('study:questions', defaultQuestions)
  
  const [activeSub, setActiveSub] = useState(null)
  const [tab, setTab] = useState('cards')

  const addSubject = () => {
    const name = window.prompt('أدخل اسم الموضوع أو المادة (مثلاً: لغة عربية، تلاوة، برمجة):')
    if (name && name.trim()) {
      setSubjects([...subjects, { id: uid(), name: name.trim() }])
    }
  }

  // دالة تعديل اسم الموضوع
  const editSubject = (e, id, currentName) => {
    e.stopPropagation() // يمنع فتح البوكس عند الضغط على زر التعديل
    const newName = window.prompt('تعديل اسم الموضوع:', currentName)
    if (newName && newName.trim() && newName.trim() !== currentName) {
      setSubjects(subjects.map(s => s.id === id ? { ...s, name: newName.trim() } : s))
    }
  }

  const deleteSubject = (e, id) => {
    e.stopPropagation()
    if (window.confirm('تحذير: راح ينحذف هذا البوكس وكل البطاقات والأسئلة اللي جواه. متأكدة؟')) {
      setSubjects(subjects.filter(s => s.id !== id))
      setCards(cards.filter(c => c.subjectId !== id))
      setQuestions(questions.filter(q => q.subjectId !== id))
    }
  }

  if (activeSub) {
    const subInfo = subjects.find(s => s.id === activeSub)
    if (!subInfo) { setActiveSub(null); return null }

    const isFirstSub = subjects.length > 0 && activeSub === subjects[0].id
    const currentCards = cards.filter(c => c.subjectId === activeSub || (!c.subjectId && isFirstSub))
    const currentQs = questions.filter(q => q.subjectId === activeSub || (!q.subjectId && isFirstSub))

    return (
      <main className="container">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '12px 20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h2 style={{ margin: 0, color: '#4f46e5' }}>📁 {subInfo.name}</h2>
          <button onClick={() => { setActiveSub(null); setTab('cards') }}>🔙 عودة للمواضيع</button>
        </div>
        
        <nav className="tabs">
          {TABS.map(([id, label]) => (
            <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{label}</button>
          ))}
        </nav>

        {tab === 'cards' && <Flashcards cards={currentCards} />}
        {tab === 'quiz' && <Quiz questions={currentQs} />}
        {tab === 'manage' && (
          <Manage 
            activeSub={activeSub} 
            cards={cards} setCards={setCards} 
            questions={questions} setQuestions={setQuestions}
            currentCards={currentCards} currentQs={currentQs}
          />
        )}
      </main>
    )
  }

  return (
    <main className="container">
      <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>مواضيعي الدراسية 📚</h1>
      <p className="muted">اضغطي على المربع للبدء بالدراسة أو أضيفي موضوعاً جديداً</p>
      
      <div className="subjects-grid">
        {subjects.map(sub => {
          const subCardsCount = cards.filter(c => c.subjectId === sub.id || (!c.subjectId && subjects[0]?.id === sub.id)).length
          const subQsCount = questions.filter(q => q.subjectId === sub.id || (!q.subjectId && subjects[0]?.id === sub.id)).length
          
          return (
            <div key={sub.id} className="subject-box" onClick={() => setActiveSub(sub.id)}>
              <div className="subject-title">{sub.name}</div>
              <div className="muted" style={{ fontSize: '12px', marginBottom: '32px' }}>
                {subCardsCount} بطاقة | {subQsCount} سؤال
              </div>
              
              <div className="box-actions">
                <button className="action-btn edit-btn" onClick={(e) => editSubject(e, sub.id, sub.name)}>تعديل</button>
                <button className="action-btn del-btn" onClick={(e) => deleteSubject(e, sub.id)}>حذف</button>
              </div>
            </div>
          )
        })}
        
        <div className="subject-box add-subject-box" onClick={addSubject}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>➕</div>
          <div className="subject-title" style={{ margin: 0, color: 'inherit' }}>إضافة موضوع</div>
        </div>
      </div>
    </main>
  )
}
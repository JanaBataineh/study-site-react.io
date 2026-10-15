import { useState } from 'react'
import { useStorage, uid } from './useStorage.js'
import { defaultCards, defaultQuestions, defaultSubjects } from './defaults.js'
import Flashcards from './components/Flashcards.jsx'
import Quiz from './components/Quiz.jsx'
import Manage from './components/Manage.jsx'

const TABS = [['cards', '🃏 البطاقات'], ['quiz', '🎮 تحدي غامبول'], ['manage', '🛠️ إدارة المحتوى']]

// نغمة بداية كرتونية مبهجة بدون الحاجة لملفات صوت خارجية
const playIntroJingle = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.11)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.11 + 0.25)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + i * 0.11)
      osc.stop(ctx.currentTime + i * 0.11 + 0.25)
    })
  } catch {}
}

export default function App() {
  const [subjects, setSubjects] = useStorage('study:subjects', defaultSubjects)
  const [cards, setCards] = useStorage('study:cards', defaultCards)
  const [questions, setQuestions] = useStorage('study:questions', defaultQuestions)
  
  const [showIntro, setShowIntro] = useState(true)
  const [activeSub, setActiveSub] = useState(null)
  const [tab, setTab] = useState('cards')

  const startShow = () => {
    playIntroJingle()
    setShowIntro(false)
  }

  const addSubject = () => {
    const name = window.prompt('أدخلي اسم المادة الجديدة في مدرسة إلمور (مثلاً: علوم، رياضيات، إنجليزي):')
    if (name && name.trim()) {
      setSubjects([...subjects, { id: uid(), name: name.trim() }])
    }
  }

  const editSubject = (e, id, currentName) => {
    e.stopPropagation()
    const newName = window.prompt('تعديل اسم الموضوع:', currentName)
    if (newName && newName.trim() && newName.trim() !== currentName) {
      setSubjects(subjects.map(s => s.id === id ? { ...s, name: newName.trim() } : s))
    }
  }

  const deleteSubject = (e, id) => {
    e.stopPropagation()
    if (window.confirm('تحذير من الآنسة سيميان: رح ينحذف هذا البوكس وكل البطاقات والأسئلة اللي جواه! متأكدة؟')) {
      setSubjects(subjects.filter(s => s.id !== id))
      setCards(cards.filter(c => c.subjectId !== id))
      setQuestions(questions.filter(q => q.subjectId !== id))
    }
  }

  // شاشة بداية كرتون غامبول
  if (showIntro) {
    return (
      <div className="gumball-intro">
        <div className="rainbow-bg" />
        <div className="logo-badge">
          <span className="logo-sub">حلقات مدرسة إلمور تقـدم</span>
          <div style={{ fontSize: '64px', margin: '10px 0' }}>🐱 🐠 🐰</div>
          <div className="logo-main">عالم غامبول</div>
          <div className="logo-amazing">المدهش للدراسة!</div>
          <p className="muted" style={{ marginTop: '18px', fontSize: '16px' }}>
            مع غامبول، داروين، وأناييس.. ادرسي وافتحي التحديات!
          </p>
          <button
            className="primary"
            onClick={startShow}
            style={{ fontSize: '22px', padding: '14px 36px', marginTop: '16px', background: '#f77f00' }}
          >
            🎬 ابدأ الحلقة!
          </button>
        </div>
      </div>
    )
  }

  if (activeSub) {
    const subInfo = subjects.find(s => s.id === activeSub)
    if (!subInfo) { setActiveSub(null); return null }

    const isFirstSub = subjects.length > 0 && activeSub === subjects[0].id
    const currentCards = cards.filter(c => c.subjectId === activeSub || (!c.subjectId && isFirstSub))
    const currentQs = questions.filter(q => q.subjectId === activeSub || (!q.subjectId && isFirstSub))

    return (
      <main className="container">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '12px 20px', borderRadius: '20px', border: '4px solid #1f2430', boxShadow: '0 6px 0 #1f2430' }}>
          <h2 style={{ margin: 0, color: '#0077b6' }}>🎒 {subInfo.name}</h2>
          <button onClick={() => { setActiveSub(null); setTab('cards') }}>🔙 عودة للمواد</button>
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
      <div style={{ background: '#fff', border: '4px solid #1f2430', borderRadius: '24px', padding: '16px', boxShadow: '0 8px 0 #1f2430', marginBottom: '20px' }}>
        <div style={{ fontSize: '42px' }}>🐱🐠🐰</div>
        <h1 style={{ fontSize: '30px', margin: '4px 0', color: '#0077b6' }}>مغامرات الدراسة في إلمور!</h1>
        <p className="muted" style={{ margin: 0 }}>اختاري المادة حتى نبدأ التحدي مع غامبول وداروين</p>
      </div>
      
      <div className="subjects-grid">
        {subjects.map((sub, idx) => {
          const subCardsCount = cards.filter(c => c.subjectId === sub.id || (!c.subjectId && subjects[0]?.id === sub.id)).length
          const subQsCount = questions.filter(q => q.subjectId === sub.id || (!q.subjectId && subjects[0]?.id === sub.id)).length
          const icons = ['🐱', '🐠', '🐰', '🍩', '🌈', '🎮']
          
          return (
            <div key={sub.id} className="subject-box" onClick={() => setActiveSub(sub.id)}>
              <div style={{ fontSize: '32px', marginBottom: '4px' }}>{icons[idx % icons.length]}</div>
              <div className="subject-title">{sub.name}</div>
              <div className="muted" style={{ fontSize: '13px', marginBottom: '36px' }}>
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
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>➕</div>
          <div className="subject-title" style={{ margin: 0 }}>إضافة مادة جديدة</div>
        </div>
      </div>

      <button onClick={() => setShowIntro(true)} style={{ marginTop: '12px', fontSize: '13px' }}>
        📺 إعادة تشغيل شارة البداية
      </button>
    </main>
  )
}
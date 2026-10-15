import { useState } from 'react'
import { useStorage, uid } from './useStorage.js'
import { defaultCards, defaultQuestions, defaultSubjects } from './defaults.js'
import Flashcards from './components/Flashcards.jsx'
import Quiz from './components/Quiz.jsx'
import Manage from './components/Manage.jsx'

const TABS = [['cards', '🃏 البطاقات'], ['quiz', '🎮 تحدي غامبول'], ['manage', '🛠️ إدارة المحتوى']]

export default function App() {
  const [subjects, setSubjects] = useStorage('study:subjects', defaultSubjects)
  const [cards, setCards] = useStorage('study:cards', defaultCards)
  const [questions, setQuestions] = useStorage('study:questions', defaultQuestions)
  
  const [showIntro, setShowIntro] = useState(true)
  const [activeSub, setActiveSub] = useState(null)
  const [tab, setTab] = useState('cards')

  const addSubject = () => {
    const name = window.prompt('أدخلي اسم المادة الجديدة في مدرسة إلمور (مثلاً: رياضيات، علوم، إنجليزي):')
    if (name && name.trim()) {
      setSubjects([...subjects, { id: uid(), name: name.trim() }])
    }
  }

  const editSubject = (e, id, currentName) => {
    e.stopPropagation()
    const newName = window.prompt('تعديل اسم المادة:', currentName)
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

  // شاشة البداية: فيديو يوتيوب يملأ الشاشة بالكامل تلقائياً مع زر دخول
  if (showIntro) {
    return (
      <div className="gumball-intro">
        {/* فيديو يوتيوب شارة البداية مع تشغيل تلقائي وميل لملء الشاشة بالكامل */}
        <iframe 
          className="fullscreen-video"
          src="https://www.youtube.com/embed/dD9tp9mn5Xg?autoplay=1&mute=0&controls=0&disablekb=1&modestbranding=1&loop=1" 
          title="Gumball Intro Fullscreen"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />

        <div className="intro-overlay-content">
          <h2 style={{ color: '#fff', margin: 0, fontSize: '22px', textShadow: '2px 2px 0 #000' }}>
            ✨ عالم غامبول المدهش - جاري تشغيل شارة البداية...
          </h2>
          <button 
            className="primary" 
            onClick={() => setShowIntro(false)}
            style={{ fontSize: '20px', padding: '12px 34px', background: '#80ed99', color: '#1f2430' }}
          >
            🚀 تخطي ودخول الموقع
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
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '14px 22px', borderRadius: '22px', border: '5px solid #1f2430', boxShadow: '0 8px 0 #1f2430' }}>
          <h2 style={{ margin: 0, color: '#3a86ff' }}>📁 {subInfo.name}</h2>
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
      <div style={{ background: '#fff', border: '5px solid #1f2430', borderRadius: '26px', padding: '20px', boxShadow: '0 10px 0 #1f2430', marginBottom: '24px', transform: 'translateZ(20px)' }}>
        <div style={{ fontSize: '46px' }}>🐱🐠🐰🍩</div>
        <h1 style={{ fontSize: '32px', margin: '6px 0', color: '#3a86ff' }}>مدرسة إلمور الثانوية 3D</h1>
        <p className="muted" style={{ margin: 0 }}>اختاري المادة الدراسية لتبدئي المغامرة مع غامبول وداروين!</p>
      </div>
      
      <div className="subjects-grid">
        {subjects.map((sub, idx) => {
          const subCardsCount = cards.filter(c => c.subjectId === sub.id || (!c.subjectId && subjects[0]?.id === sub.id)).length
          const subQsCount = questions.filter(q => q.subjectId === sub.id || (!q.subjectId && subjects[0]?.id === sub.id)).length
          const icons = ['📘', '🧪', '🌍', '📐', '💻', '🎨']
          
          return (
            <div key={sub.id} className="subject-box" onClick={() => setActiveSub(sub.id)}>
              <div style={{ fontSize: '36px', marginBottom: '6px' }}>{icons[idx % icons.length]}</div>
              <div className="subject-title">{sub.name}</div>
              <div className="muted" style={{ fontSize: '13px', marginBottom: '38px' }}>
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
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>➕</div>
          <div className="subject-title" style={{ margin: 0 }}>إضافة مادة جديدة</div>
        </div>
      </div>

      <button onClick={() => setShowIntro(true)} style={{ marginTop: '16px', fontSize: '15px', background: '#ffb703' }}>
        📺 إعادة عرض شارة البداية
      </button>
    </main>
  )
}
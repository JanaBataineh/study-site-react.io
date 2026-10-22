import { useState, useEffect } from 'react'
import { useStorage, uid } from './useStorage.js'
import { defaultCards, defaultQuestions, defaultSubjects } from './defaults.js'
import Flashcards from './components/Flashcards.jsx'
import Quiz from './components/Quiz.jsx'
import Manage from './components/Manage.jsx'
import Intro from './components/Intro.jsx'

const TABS = [['cards', '🃏 البطاقات'], ['quiz', '🎮 تحدي غامبول'], ['manage', '🛠️ إدارة المحتوى']]
// أضيفي هذه المصفوفة قبل return في مكون App
const BACKGROUNDS = [
  '/1.jpg', // تأكدي أن الأسماء تطابق ما حفظتيه في مجلد public
  '/Anais sister.jpg',
  '/download (31).jpg',
  '/download (32).jpg',
  '/download (33).jpg',
  '/Gumball and Darwin wallpaper.jpg',
  '/Pollie Fitzgerald Wallpaper.jpg',
  '/potato.jpg',
  '/Wallpaper.jpg'
];
export default function App() {
  const [subjects, setSubjects] = useStorage('study:subjects', defaultSubjects)
  const [cards, setCards] = useStorage('study:cards', defaultCards)
  const [questions, setQuestions] = useStorage('study:questions', defaultQuestions)

  const [showIntro, setShowIntro] = useState(true)
  const [activeSub, setActiveSub] = useState(null)
  const [tab, setTab] = useState('cards')
  // حالة جديدة لمعرفة هل انتهى الفيديو أم لا
  const [videoEnded, setVideoEnded] = useState(false)

  // أضيفي هذه الحالات (States) تحت حالات useState الموجودة
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [selectedBg, setSelectedBg] = useState(BACKGROUNDS[0]);
  const [editingSubId, setEditingSubId] = useState(null);


  const addSubject = () => {
    const name = window.prompt('أدخلي اسم المادة الجديدة في مدرسة إلمور')
    if (name && name.trim()) {
      setSubjects([...subjects, { id: uid(), name: name.trim() }])
    }
  }

const openEditSubjectModal = (e, sub) => {
    e.stopPropagation();
    setEditingSubId(sub.id); // حفظ الـ id للمادة التي نعدلها
    setNewSubName(sub.name); // جلب الاسم الحالي
    setSelectedBg(sub.bg || BACKGROUNDS[0]); // جلب الخلفية الحالية
    setShowAddModal(true);
  };

  const deleteSubject = (e, id) => {
    e.stopPropagation()
    if (window.confirm('تحذير من الآنسة سيميان: رح ينحذف هذا البوكس وكل البطاقات والأسئلة اللي جواه! متأكدة؟')) {
      setSubjects(subjects.filter(s => s.id !== id))
      setCards(cards.filter(c => c.subjectId !== id))
      setQuestions(questions.filter(q => q.subjectId !== id))
    }
  }

  useEffect(() => {
    // إذا انتهت شاشة البداية (ودخلنا للموقع)
    if (!showIntro) {
      const bgVideo = document.getElementById('bg-video');
      if (bgVideo) {
        const handleEnded = () => setVideoEnded(true);
        // الاستماع لحدث انتهاء الفيديو
        bgVideo.addEventListener('ended', handleEnded);

        // كإجراء احتياطي: إذا كان الفيديو منتهياً بالفعل
        if (bgVideo.ended) setVideoEnded(true);

        return () => bgVideo.removeEventListener('ended', handleEnded);
      } else {
        setVideoEnded(true);
      }
    } else {
      // عند العودة لشاشة البداية، نعيد تعيين الحالة ونوقف الفيديو
      setVideoEnded(false);
      const bgVideo = document.getElementById('bg-video');
      if (bgVideo) {
        bgVideo.pause();
        bgVideo.currentTime = 0; // إرجاع الفيديو للصفر
      }
    }
  }, [showIntro])

  // استبدلي دالة addSubject القديمة بهذه:
  const openAddSubjectModal = () => {
    setEditingSubId(null); // تصفير الـ id يعني أننا نضيف مادة جديدة
    setNewSubName('');
    setSelectedBg(BACKGROUNDS[0]);
    setShowAddModal(true);
  };

  const handleSaveSubject = (e) => {
    e.preventDefault();
    if (newSubName.trim()) {
      if (editingSubId) {
        // تحديث المادة الموجودة
        setSubjects(subjects.map(s =>
          s.id === editingSubId ? { ...s, name: newSubName.trim(), bg: selectedBg } : s
        ));
      } else {
        // إضافة مادة جديدة
        setSubjects([...subjects, { id: uid(), name: newSubName.trim(), bg: selectedBg }]);
      }
      setShowAddModal(false);
      setEditingSubId(null);
    }
  };

  // شاشة البداية التفاعلية (شخصيات متحركة + موسيقى)
  if (showIntro) {
    return <Intro onEnter={() => setShowIntro(false)} />
  }
  if (!videoEnded) {
    return null;
  }

  if (activeSub) {
    const subInfo = subjects.find(s => s.id === activeSub)
    if (!subInfo) { setActiveSub(null); return null }

    const isFirstSub = subjects.length > 0 && activeSub === subjects[0].id
    const currentCards = cards.filter(c => c.subjectId === activeSub || (!c.subjectId && isFirstSub))
    const currentQs = questions.filter(q => q.subjectId === activeSub || (!q.subjectId && isFirstSub))


    return (
      <main className="container smooth-show">
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
    <main className="container smooth-show">
      <div style={{
        background: 'url("/Gumball and Darwin (1).jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        border: '5px solid #1f2430',
        borderRadius: '26px',
        padding: '24px 20px',
        boxShadow: '0 10px 0 #1f2430',
        marginBottom: '24px',
        transform: 'translateZ(20px)'
      }}>
        <h1 style={{
          fontSize: '34px',
          margin: '6px 0',
          color: '#fdfdfd',
          textShadow: '2px 2px 0 #1f2430, -1.5px -1.5px 0 #1f2430, 1.5px -1.5px 0 #1f2430, -1.5px 1.5px 0 #1f2430'
        }}>
          مدرسة إلمور الثانوية
        </h1>
        <p style={{
          margin: 0,
          color: '#ffffff',
          fontSize: '18px',
          fontWeight: '900',
          textShadow: '2px 2px 0 #1f2430, -1.5px -1.5px 0 #1f2430, 1.5px -1.5px 0 #1f2430, -1.5px 1.5px 0 #1f2430'
        }}>
          اختاري المادة الدراسية لتبدئي المغامرة مع غامبول وداروين!
        </p>
      </div>

      <div className="subjects-grid">
        {subjects.map((sub, idx) => {
          const subCardsCount = cards.filter(c => c.subjectId === sub.id || (!c.subjectId && subjects[0]?.id === sub.id)).length
          const subQsCount = questions.filter(q => q.subjectId === sub.id || (!q.subjectId && subjects[0]?.id === sub.id)).length
          const icons = ['📘', '🧪', '🌍', '📐', '💻', '🎨']

          return (
            <div key={sub.id} className="subject-box" onClick={() => setActiveSub(sub.id)}
              style={sub.bg ? {
                backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url("${sub.bg}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: '#fff',
                border: '5px solid #fff' // لجعل الإطار يبرز مع الصور
              } : {}}
            >
              {!sub.bg && <div style={{ fontSize: '36px', marginBottom: '6px' }}>{icons[idx % icons.length]}</div>}
              <div className="subject-title" style={{ color: sub.bg ? '#fff' : 'inherit', textShadow: sub.bg ? '0 2px 4px #000' : 'none' }}>
                {sub.name}
              </div>
              <div className="muted" style={{ fontSize: '13px', marginBottom: '38px', color: sub.bg ? '#fff' : 'inherit', textShadow: sub.bg ? '0 1px 2px #000' : 'none' }}>
                {subCardsCount} بطاقة | {subQsCount} سؤال
              </div>

              <div className="box-actions">
                <button className="action-btn edit-btn" onClick={(e) => openEditSubjectModal(e, sub)}>تعديل</button>
                <button className="action-btn del-btn" onClick={(e) => deleteSubject(e, sub.id)}>حذف</button>
              </div>
            </div>
          )
        })}
        {/* استبدلي onClick={addSubject} بـ onClick={openAddSubjectModal} */}
        <div className="subject-box add-subject-box" onClick={openAddSubjectModal}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>➕</div>
          <div className="subject-title" style={{ margin: 0 }}>إضافة مادة جديدة</div>
        </div>
      </div>

  {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center' }}>
            {/* يتغير العنوان حسب الوضع */}
            <h3 style={{ marginTop: 0 }}>
              {editingSubId ? 'تعديل المادة ✏️' : 'إضافة مادة جديدة 🎒'}
            </h3>
            
            <form onSubmit={handleSaveSubject}>
              <input
                autoFocus
                placeholder="أدخلي اسم المادة ..."
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                style={{ marginBottom: '20px' }}
              />

              <p className="muted" style={{ textAlign: 'start' }}>اختاري شخصية غامبول للمادة:</p>
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', justifyContent: 'center' }}>
                {BACKGROUNDS.map(bg => (
                  <div
                    key={bg}
                    onClick={() => setSelectedBg(bg)}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '16px',
                      backgroundImage: `url("${bg}")`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      cursor: 'pointer',
                      border: selectedBg === bg ? '4px solid #3a86ff' : '4px solid transparent',
                      transform: selectedBg === bg ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.2s',
                      boxShadow: selectedBg === bg ? '0 4px 0 #1f2430' : 'none'
                    }}
                  />
                ))}
              </div>

              <div className="modal-actions" style={{ marginTop: '24px', justifyContent: 'center' }}>
                <button type="button" onClick={() => setShowAddModal(false)}>إلغاء</button>
                {/* يتغير زر الحفظ حسب الوضع */}
                <button className="primary" type="submit">
                  {editingSubId ? 'حفظ التعديل' : 'إضافة المادة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
import { useState } from 'react'

// عبارات غامبول عند الإجابة الصحيحة
const GUMBALL_QUOTES = [
  'يا سلااام! دماغك شغال أسرع من خططي العبقريّة! 😼✨',
  'كفو والله! الآنسة سيميان رح تنجلط من تفوقك اليوم! 🎉',
  'واااو! إجابة أسطورية.. تستاهلي وسام أذكى شخص في إلمور! 🏆',
  'برافو! حتى أناييس ما كانت رح تحلها بهالسرعة! 🐱🔥',
  'صح 100%! هيك الذكاء ولا بلاش، كملي يا بطلة! 🚀'
]

// عبارات داروين اللطيفة والمضحكة عند الإجابة الخاطئة
const DARWIN_QUOTES = [
  'يا إلهي! لا تحزني يا صديقتي، حتى أنا وغامبول بنغلط كل يوم! 🐠🧡',
  'أوووبس! يبدو أن عقلك أخذ قيلولة مع السيد ريتشارد عالكنباية! 🛋️💤',
  'لا بأس لا بأس! تنفسي بعمق.. السؤال الجاي رح تكسري الدنيا! 🌊✨',
  'آااخ! كانت قريبة جداً! ركزي بالسؤال اللي بعده وأنا بشجعك! 📣🐠',
  'مش مشكلة أبداً! الغلط هو أول خطوة لنصير عباقرة مثل أناييس! 🌸'
]

// مؤثرات صوتية كرتونية للصح والخطأ
const playFeedbackSound = (isCorrect) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    if (isCorrect) {
      // نغمة فوز مبهجة
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1) // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
      osc.start()
      osc.stop(ctx.currentTime + 0.35)
    } else {
      // نغمة كرتونية كوميدية للخطأ (Womp Womp)
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(300, ctx.currentTime)
      osc.frequency.linearRampToValueAtTime(140, ctx.currentTime + 0.35)
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38)
      osc.start()
      osc.stop(ctx.currentTime + 0.38)
    }
  } catch {}
}

// رسمة وجه غامبول الكرتونية (SVG)
const GumballAvatar = () => (
  <svg viewBox="0 0 100 100" width="68" height="68">
    <circle cx="50" cy="54" r="36" fill="#38b6ff" stroke="#1f2430" strokeWidth="4" />
    <polygon points="22,32 18,10 38,22" fill="#38b6ff" stroke="#1f2430" strokeWidth="4" />
    <polygon points="78,32 82,10 62,22" fill="#38b6ff" stroke="#1f2430" strokeWidth="4" />
    <ellipse cx="38" cy="48" rx="9" ry="12" fill="#fff" stroke="#1f2430" strokeWidth="3" />
    <ellipse cx="62" cy="48" rx="9" ry="12" fill="#fff" stroke="#1f2430" strokeWidth="3" />
    <circle cx="40" cy="48" r="4.5" fill="#1f2430" />
    <circle cx="60" cy="48" r="4.5" fill="#1f2430" />
    <polygon points="47,58 53,58 50,63" fill="#ff758f" stroke="#1f2430" strokeWidth="2" />
    <path d="M 35 68 Q 50 80 65 68" fill="none" stroke="#1f2430" strokeWidth="4" strokeLinecap="round" />
    <line x1="12" y1="54" x2="25" y2="56" stroke="#1f2430" strokeWidth="3" />
    <line x1="12" y1="63" x2="25" y2="62" stroke="#1f2430" strokeWidth="3" />
    <line x1="88" y1="54" x2="75" y2="56" stroke="#1f2430" strokeWidth="3" />
    <line x1="88" y1="63" x2="75" y2="62" stroke="#1f2430" strokeWidth="3" />
  </svg>
)

// رسمة وجه داروين الكرتونية (SVG)
const DarwinAvatar = () => (
  <svg viewBox="0 0 100 100" width="68" height="68">
    <ellipse cx="48" cy="54" rx="34" ry="30" fill="#ff7b00" stroke="#1f2430" strokeWidth="4" />
    <polygon points="78,52 95,38 92,68" fill="#ff7b00" stroke="#1f2430" strokeWidth="4" />
    <ellipse cx="36" cy="46" rx="8" ry="11" fill="#fff" stroke="#1f2430" strokeWidth="3" />
    <ellipse cx="56" cy="46" rx="8" ry="11" fill="#fff" stroke="#1f2430" strokeWidth="3" />
    <circle cx="37" cy="46" r="4" fill="#1f2430" />
    <circle cx="55" cy="46" r="4" fill="#1f2430" />
    <circle cx="25" cy="58" r="5" fill="#ff4d6d" opacity="0.6" />
    <circle cx="67" cy="58" r="5" fill="#ff4d6d" opacity="0.6" />
    <path d="M 38 69 Q 46 62 56 69" fill="none" stroke="#1f2430" strokeWidth="4" strokeLinecap="round" />
  </svg>
)

export default function Quiz({ questions }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [feedbackQuote, setFeedbackQuote] = useState('')

  if (questions.length === 0) {
    return <p className="muted">ما في أسئلة بعد! أضيفي أسئلة من تبويب "🛠️ إدارة المحتوى" ليبدأ تحدي غامبول.</p>
  }

  const current = questions[index]
  const isCorrectAnswer = selected !== null && selected === current.correct

  const choose = (i) => {
    if (selected !== null) return
    setSelected(i)
    const right = i === current.correct
    playFeedbackSound(right)

    if (right) {
      setScore(score + 1)
      const randomGumball = GUMBALL_QUOTES[Math.floor(Math.random() * GUMBALL_QUOTES.length)]
      setFeedbackQuote(randomGumball)
    } else {
      const randomDarwin = DARWIN_QUOTES[Math.floor(Math.random() * DARWIN_QUOTES.length)]
      setFeedbackQuote(randomDarwin)
    }
  }

  const next = () => {
    if (index + 1 >= questions.length) {
      setFinished(true)
    } else {
      setIndex(index + 1)
      setSelected(null)
      setFeedbackQuote('')
    }
  }

  const restart = () => {
    setIndex(0)
    setSelected(null)
    setScore(0)
    setFinished(false)
    setFeedbackQuote('')
  }

  const cls = (i) => {
    if (selected === null) return 'option'
    if (i === current.correct) return 'option correct'
    if (i === selected) return 'option wrong'
    return 'option'
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <section style={{ background: '#fff', padding: '24px', borderRadius: '24px', border: '4px solid #1f2430', boxShadow: '0 8px 0 #1f2430' }}>
        <div style={{ fontSize: '56px' }}>{pct >= 70 ? '🐰👑' : '🐠💪'}</div>
        <h2 style={{ fontSize: '28px', margin: '8px 0' }}>نتيجتك في تحدي إلمور: {score} / {questions.length}</h2>
        <p style={{ fontSize: '18px', fontWeight: '900', color: pct >= 70 ? '#0077b6' : '#f77f00' }}>
          {pct === 100
            ? 'أناييس: "مستحيل!! علامة كاملة! أنتِ رسمياً أذكى مني ومن غامبول مجتمعين!" 🧠✨'
            : pct >= 70
            ? 'غامبول: "واااو نتيجة رهيبة! نيكول رح تعلق شهادتك على الثلاجة اليوم!" 🎉🐱'
            : 'داروين: "محاولة رائعة يا صديقتي! جربي تعيدي التحدي ورح تجيبي العلامة الكاملة!" 🐠🧡'}
        </p>
        <button className="primary" onClick={restart} style={{ fontSize: '18px', padding: '12px 28px' }}>
          🔄 إعادة التحدي مع غامبول
        </button>
      </section>
    )
  }

  return (
    <section>
      <p className="muted">سؤال {index + 1} من {questions.length} 🌟</p>
      <div style={{ background: '#fff', padding: '18px', borderRadius: '20px', border: '4px solid #1f2430', boxShadow: '0 6px 0 #1f2430', marginBottom: '16px' }}>
        <h2 style={{ margin: 0 }}>{current.q}</h2>
      </div>

      {current.options.map((opt, i) => (
        <button key={i} className={cls(i)} onClick={() => choose(i)}>{opt}</button>
      ))}

      {/* ظهور غامبول أو داروين بعد اختيار الإجابة */}
      {selected !== null && (
        <>
          <div className={`character-feedback ${isCorrectAnswer ? 'gumball' : 'darwin'}`}>
            <div className="char-avatar">
              {isCorrectAnswer ? <GumballAvatar /> : <DarwinAvatar />}
            </div>
            <div>
              <div className="char-name" style={{ color: isCorrectAnswer ? '#0077b6' : '#d62828' }}>
                {isCorrectAnswer ? '🐱 غامبول واترسون يقول:' : '🐠 داروين واترسون يقول:'}
              </div>
              <div className="char-quote">{feedbackQuote}</div>
            </div>
          </div>

          <button className="primary" onClick={next} style={{ fontSize: '18px', padding: '12px 30px' }}>
            {index + 1 >= questions.length ? '🏆 عرض النتيجة النهائية' : 'السؤال التالي ⬅️'}
          </button>
        </>
      )}
    </section>
  )
}
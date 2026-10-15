import { useState } from 'react'

const GUMBALL_QUOTES = [
  'يا سلااام! دماغك شغال أسرع من خططي العبقريّة! 😼✨',
  'كفو والله! الآنسة سيميان رح تنجلط من تفوقك اليوم! 🎉',
  'واااو! إجابة أسطورية.. تستاهلي وسام أذكى شخص في إلمور! 🏆',
  'برافو! حتى أناييس ما كانت رح تحلها بهالسرعة! 🐱🔥',
  'صح 100%! هيك الذكاء ولا بلاش، كملي يا بطلة! 🚀'
]

const DARWIN_QUOTES = [
  'يا إلهي! لا تحزني يا صديقتي، حتى أنا وغامبول بنغلط كل يوم! 🐠🧡',
  'أوووبس! يبدو أن عقلك أخذ قيلولة مع السيد ريتشارد عالكنباية! 🛋️💤',
  'لا بأس لا بأس! تنفسي بعمق.. السؤال الجاي رح تكسري الدنيا! 🌊✨',
  'آااخ! كانت قريبة جداً! ركزي بالسؤال اللي بعده وأنا بشجعك! 📣🐠',
  'مش مشكلة أبداً! الغلط هو أول خطوة لنصير عباقرة مثل أناييس! 🌸'
]

const playFeedbackSound = (isCorrect) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    if (isCorrect) {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, ctx.currentTime)
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1)
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
      osc.start()
      osc.stop(ctx.currentTime + 0.35)
    } else {
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
  </svg>
)

const DarwinAvatar = () => (
  <svg viewBox="0 0 100 100" width="68" height="68">
    <ellipse cx="48" cy="54" rx="34" ry="30" fill="#ff7b00" stroke="#1f2430" strokeWidth="4" />
    <polygon points="78,52 95,38 92,68" fill="#ff7b00" stroke="#1f2430" strokeWidth="4" />
    <ellipse cx="36" cy="46" rx="8" ry="11" fill="#fff" stroke="#1f2430" strokeWidth="3" />
    <ellipse cx="56" cy="46" rx="8" ry="11" fill="#fff" stroke="#1f2430" strokeWidth="3" />
    <circle cx="37" cy="46" r="4" fill="#1f2430" />
    <circle cx="55" cy="46" r="4" fill="#1f2430" />
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
    return <p className="muted">ما في أسئلة بعد! أضيفي أسئلة من تبويب "إدارة المحتوى".</p>
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
      setFeedbackQuote(GUMBALL_QUOTES[Math.floor(Math.random() * GUMBALL_QUOTES.length)])
    } else {
      setFeedbackQuote(DARWIN_QUOTES[Math.floor(Math.random() * DARWIN_QUOTES.length)])
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
      <section style={{ background: '#fff', padding: '28px', borderRadius: '28px', border: '5px solid #1f2430', boxShadow: '0 10px 0 #1f2430' }}>
        <div style={{ fontSize: '60px' }}>{pct >= 70 ? '🐰👑' : '🐠💪'}</div>
        <h2 style={{ fontSize: '30px', margin: '10px 0' }}>نتيجتك: {score} / {questions.length}</h2>
        <p style={{ fontSize: '19px', fontWeight: '900', color: pct >= 70 ? '#3a86ff' : '#ffb703' }}>
          {pct === 100 ? 'أناييس: "مستحيل! علامة كاملة أذهلتني تماماً!" 🧠✨' : 'غامبول: "أداء رائع جداً، استمري يا بطلة!" 🎉'}
        </p>
        <button className="primary" onClick={restart} style={{ fontSize: '18px', padding: '12px 28px' }}>
          🔄 إعادة التحدي
        </button>
      </section>
    )
  }

  return (
    <section>
      <p className="muted">سؤال {index + 1} من {questions.length} 🌟</p>
      <div style={{ background: '#fff', padding: '20px', borderRadius: '24px', border: '5px solid #1f2430', boxShadow: '0 8px 0 #1f2430', marginBottom: '18px' }}>
        <h2 style={{ margin: 0 }}>{current.q}</h2>
      </div>

      {current.options.map((opt, i) => (
        <button key={i} className={cls(i)} onClick={() => choose(i)}>{opt}</button>
      ))}

      {selected !== null && (
        <>
          <div className={`character-feedback ${isCorrectAnswer ? 'gumball' : 'darwin'}`}>
            <div className="char-avatar">
              {isCorrectAnswer ? <GumballAvatar /> : <DarwinAvatar />}
            </div>
            <div>
              <div className="char-name">
                {isCorrectAnswer ? '🐱 غامبول يقول:' : '🐠 داروين يقول:'}
              </div>
              <div className="char-quote">{feedbackQuote}</div>
            </div>
          </div>

          <button className="primary" onClick={next} style={{ fontSize: '18px', padding: '12px 30px' }}>
            {index + 1 >= questions.length ? '🏆 عرض النتيجة' : 'السؤال التالي ⬅️'}
          </button>
        </>
      )}
    </section>
  )
}
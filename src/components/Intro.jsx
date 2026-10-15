import { useEffect, useRef, useState } from 'react'

// ضعي ملفاتك في مجلد public/ بهذه الأسماء (أو غيّري الأسماء هنا):
//   public/gumball.png   صورة الشخصية الأولى (يفضل PNG بخلفية شفافة)
//   public/darwin.png    صورة الشخصية الثانية (يفضل PNG بخلفية شفافة)
//   public/intro.mp3     موسيقى شارة البداية
const GUMBALL_IMG = '/gumball.png'
const DARWIN_IMG = '/darwin.png'
const MUSIC_SRC = '/intro.mp3'

const STARS = Array.from({ length: 90 }, (_, i) => ({
  id: i, left: Math.random() * 100, top: Math.random() * 100,
  size: 2 + Math.random() * 5, delay: Math.random() * 3, dur: 1.5 + Math.random() * 2.5
}))

const RAINBOW = ['#ff2d95', '#ff8fd0', '#f6f7a8', '#c9a6ff', '#7a5cff']
const LETTERS = [
  ['G', '#2ecc40'], ['U', '#ff8c00'], ['M', '#1e3cff'], ['B', '#e0201c'],
  ['A', '#2ecc40'], ['L', '#1aa3e8'], ['L', '#b45cff']
]

function Character({ src, name, className, emoji }) {
  const [broken, setBroken] = useState(false)
  const [jump, setJump] = useState(false)
  const poke = () => { setJump(true); setTimeout(() => setJump(false), 700) }

  return (
    <div className={`intro-char ${className} ${jump ? 'poked' : ''}`} onClick={poke} onMouseEnter={poke}>
      {broken
        ? <div className="intro-char-fallback">{emoji}<small>ضعي {name} في public</small></div>
        : <img src={src} alt={name} draggable="false" onError={() => setBroken(true)} />}
    </div>
  )
}

export default function Intro({ onEnter }) {
  const [started, setStarted] = useState(false)
  const [muted, setMuted] = useState(false)
  const audioRef = useRef(null)

  const start = () => {
    setStarted(true)
    const a = audioRef.current
    if (a) { a.currentTime = 0; a.volume = 0.8; a.play().catch(() => {}) }
  }
  const toggleMute = () => {
    const a = audioRef.current
    if (!a) return
    a.muted = !a.muted
    setMuted(a.muted)
  }
  const enter = () => { audioRef.current?.pause(); onEnter() }

  useEffect(() => () => audioRef.current?.pause(), [])

  return (
    <div className={`intro-screen ${started ? 'playing' : ''}`}>
      <audio ref={audioRef} src={MUSIC_SRC} loop preload="auto" />

      <div className="intro-stars">
        {STARS.map(s => (
          <span key={s.id} className="intro-star" style={{
            left: s.left + '%', top: s.top + '%', width: s.size, height: s.size,
            animationDelay: s.delay + 's', animationDuration: s.dur + 's'
          }} />
        ))}
      </div>

      <div className="intro-logo">
        <div className="intro-rainbow">
          {RAINBOW.map((c, i) => (
            <div key={i} className="arc" style={{ background: c, inset: `${i * 0.5}em`, animationDelay: i * 0.12 + 's' }} />
          ))}
          <div className="arc-hole" />
        </div>
        <div className="intro-word-top">عالم</div>
        <div className="intro-word-main">
          {LETTERS.map(([ch, color], i) => (
            <span key={i} style={{ color, animationDelay: i * 0.1 + 's' }}>{ch}</span>
          ))}
        </div>
        <div className="intro-word-bottom">المدهش</div>
      </div>

      <Character src={GUMBALL_IMG} name="الشخصية الأولى" emoji="🐱" className="char-left" />
      <Character src={DARWIN_IMG} name="الشخصية الثانية" emoji="🐠" className="char-right" />

      <div className="intro-controls">
        {!started ? (
          <button className="primary intro-btn" onClick={start}>🎬 ابدأ المغامرة</button>
        ) : (
          <>
            <button className="primary intro-btn" onClick={enter}>🚀 ادخلي للموقع</button>
            <button onClick={toggleMute}>{muted ? '🔇 تشغيل الصوت' : '🔊 كتم الصوت'}</button>
          </>
        )}
      </div>
    </div>
  )
}
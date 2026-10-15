import { useEffect, useRef, useState } from 'react'

// ضعي ملفاتك في مجلد public/ بهذه الأسماء (أو غيّري الأسماء هنا):
//   public/gumball.png   صورة الشخصية الأولى (يفضل PNG بخلفية شفافة)
//   public/darwin.png    صورة الشخصية الثانية (يفضل PNG بخلفية شفافة)
//   public/intro.mp3     موسيقى شارة البداية
const GUMBALL_IMG = '/gumball.png'
const DARWIN_IMG = '/darwin.png'
const MUSIC_SRC = '/intro.mp3'

const STARS = Array.from({ length: 70 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: 2 + Math.random() * 4,
  delay: Math.random() * 3,
  dur: 1.5 + Math.random() * 2.5
}))

const RAINBOW = ['#ff2d95', '#ff8fd0', '#f6f7a8', '#c9a6ff', '#7a5cff']
const LETTERS = [
  ['G', '#2ecc40'], ['U', '#ff8c00'], ['M', '#1e3cff'], ['B', '#e0201c'],
  ['A', '#2ecc40'], ['L', '#1aa3e8'], ['L', '#b45cff']
]


const SKETCHFAB_ID = '7096c6b84fb14800bd64435bb7a95dba'
const SKETCHFAB_SRC = `https://sketchfab.com/models/${SKETCHFAB_ID}/embed?autostart=1&autospin=0.4&transparent=1&ui_hint=0&ui_infos=0&ui_inspector=0&ui_stop=0&ui_help=0&ui_settings=0&ui_vr=0&preload=1`

function Model3D() {
  return (
    <div className="intro-3d">
      <iframe
        title="Gumball & Darwin (The Amazing World of Gumball)"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; fullscreen; xr-spatial-tracking"
        src={SKETCHFAB_SRC}
      />
      <p className="intro-3d-credit">
        <a href="https://sketchfab.com/3d-models/gumball-darwin-the-amazing-world-of-gumball-7096c6b84fb14800bd64435bb7a95dba" target="_blank" rel="nofollow noreferrer">Gumball &amp; Darwin (The Amazing World of Gumball)</a>
        {' by '}
        <a href="https://sketchfab.com/elvinguhl" target="_blank" rel="nofollow noreferrer">elvinguhl</a>
        {' on '}
        <a href="https://sketchfab.com" target="_blank" rel="nofollow noreferrer">Sketchfab</a>
      </p>
    </div>
  )
}

function Character({ src, name, className, emoji }) {
  const [broken, setBroken] = useState(false)
  const [jump, setJump] = useState(false)

  const poke = () => {
    setJump(true)
    setTimeout(() => setJump(false), 700)
  }

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
    if (a) {
      a.currentTime = 0
      a.volume = 0.8
      a.play().catch(() => {})
    }
  }

  const toggleMute = () => {
    const a = audioRef.current
    if (!a) return
    a.muted = !a.muted
    setMuted(a.muted)
  }

  const enter = () => {
    const a = audioRef.current
    if (a) a.pause()
    onEnter()
  }

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
            <div key={i} className="arc" style={{
              background: c, inset: i * 16 + 'px', animationDelay: i * 0.12 + 's'
            }} />
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

      <Model3D />

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
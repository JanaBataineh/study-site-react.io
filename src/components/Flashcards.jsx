import { useState } from 'react'

export default function Flashcards({ cards }) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  if (cards.length === 0) return <p className="muted">ما في بطاقات. أضف بطاقات من تبويب "إدارة المحتوى".</p>

  const i = Math.min(index, cards.length - 1)
  const card = cards[i]

  const go = (step) => {
    setFlipped(false)
    setIndex((i + step + cards.length) % cards.length)
  }

  return (
    <section>
      <p className="muted">بطاقة {i + 1} من {cards.length}</p>
      <div className="card-scene" onClick={() => setFlipped(!flipped)}>
        <div className={'card' + (flipped ? ' flipped' : '')}>
          <div className="face front" style={{ whiteSpace: 'pre-wrap' }}>{card.q}</div>
          <div className="face back" style={{ whiteSpace: 'pre-wrap' }}>{card.a}</div>
        </div>
      </div>
      <p className="muted">اضغط على البطاقة لقلبها</p>
      <div className="row">
        <button onClick={() => go(-1)}>السابق</button>
        <button onClick={() => go(1)}>التالي</button>
      </div>
    </section>
  )
}

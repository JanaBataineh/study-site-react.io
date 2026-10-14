import { useState } from 'react'

export default function Quiz({ questions }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  if (questions.length === 0) return <p className="muted">ما في أسئلة. أضف أسئلة من تبويب "إدارة المحتوى".</p>

  const current = questions[index]

  const choose = (i) => {
    if (selected !== null) return
    setSelected(i)
    if (i === current.correct) setScore(score + 1)
  }

  const next = () => {
    if (index + 1 >= questions.length) setFinished(true)
    else { setIndex(index + 1); setSelected(null) }
  }

  const restart = () => {
    setIndex(0); setSelected(null); setScore(0); setFinished(false)
  }

  const cls = (i) => {
    if (selected === null) return 'option'
    if (i === current.correct) return 'option correct'
    if (i === selected) return 'option wrong'
    return 'option'
  }

  if (finished) {
    return (
      <section>
        <h2>نتيجتك: {score} / {questions.length}</h2>
        <button className="primary" onClick={restart}>إعادة الاختبار</button>
      </section>
    )
  }

  return (
    <section>
      <p className="muted">سؤال {index + 1} من {questions.length}</p>
      <h2>{current.q}</h2>
      {current.options.map((opt, i) => (
        <button key={i} className={cls(i)} onClick={() => choose(i)}>{opt}</button>
      ))}
      {selected !== null && (
        <button className="primary" onClick={next}>
          {index + 1 >= questions.length ? 'النتيجة' : 'التالي'}
        </button>
      )}
    </section>
  )
}

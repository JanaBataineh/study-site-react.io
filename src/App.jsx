import { useState } from 'react'
import { useStorage } from './useStorage.js'
import { defaultCards, defaultQuestions } from './defaults.js'
import Flashcards from './components/Flashcards.jsx'
import Quiz from './components/Quiz.jsx'
import Manage from './components/Manage.jsx'

const TABS = [
  ['cards', 'البطاقات'],
  ['quiz', 'الاختبار'],
  ['manage', 'إدارة المحتوى']
]

export default function App() {
  const [tab, setTab] = useState('cards')
  const [cards, setCards] = useStorage('study:cards', defaultCards)
  const [questions, setQuestions] = useStorage('study:questions', defaultQuestions)

  return (
    <main className="container">
      <h1>موقع الدراسة</h1>
      <nav className="tabs">
        {TABS.map(([id, label]) => (
          <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </nav>
      {tab === 'cards' && <Flashcards cards={cards} />}
      {tab === 'quiz' && <Quiz questions={questions} />}
      {tab === 'manage' && (
        <Manage cards={cards} setCards={setCards} questions={questions} setQuestions={setQuestions} />
      )}
    </main>
  )
}

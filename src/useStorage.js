import { useState, useEffect } from 'react'

// يحفظ القيمة في localStorage تلقائياً ويرجعها عند فتح الموقع
export function useStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw) return JSON.parse(raw)
    } catch {}
    return initial
  })

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
  }, [key, value])

  return [value, setValue]
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

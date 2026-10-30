import { useState, useEffect } from 'react'
import { db } from './firebase.js'
import { doc, getDoc, setDoc } from 'firebase/firestore'

// هذه الدالة صارت تتصل بـ Firebase بدلاً من ذاكرة المتصفح
export function useStorage(key, initial) {
  const [value, setValue] = useState(initial)
  const [isLoaded, setIsLoaded] = useState(false)

  // 1. جلب البيانات من السحابة عند فتح الموقع
  useEffect(() => {
    const loadData = async () => {
      try {
        // استبدال النقطتين الرأسيتين بشرطة لتناسب أسماء ملفات فايربيز
        const safeKey = key.replace(':', '-') 
        const docRef = doc(db, "elmoreData", safeKey) 
        
        const snapshot = await getDoc(docRef)
        if (snapshot.exists()) {
          setValue(snapshot.data().items)
        }
      } catch (error) {
        console.error("خطأ في جلب البيانات:", error)
      }
      setIsLoaded(true)
    }
    loadData()
  }, [key])

  // 2. حفظ البيانات في السحابة عند أي إضافة/حذف/تعديل
  useEffect(() => {
    if (!isLoaded) return // لا تحفظ قبل أن يكتمل التحميل
    
    const saveData = async () => {
      try {
        const safeKey = key.replace(':', '-')
        const docRef = doc(db, "elmoreData", safeKey)
        await setDoc(docRef, { items: value })
      } catch (error) {
        console.error("خطأ في حفظ البيانات:", error)
      }
    }
    saveData()
  }, [key, value, isLoaded])

  return [value, setValue]
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
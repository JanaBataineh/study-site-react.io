// بيانات مبدئية تظهر أول مرة فقط، وبعدها كل التعديلات بتنحفظ في المتصفح
export const defaultCards = [
  { id: 'c1', q: 'شو هو PRIMARY KEY؟', a: 'عمود (أو مجموعة أعمدة) يحدد كل صف بشكل فريد ولا يقبل NULL.' },
  { id: 'c2', q: 'شو الفرق بين INNER JOIN و LEFT JOIN؟', a: 'INNER يرجع الصفوف المتطابقة فقط، LEFT يرجع كل صفوف الجدول الأيسر.' },
  { id: 'c3', q: 'شو وظيفة GROUP BY؟', a: 'تجميع الصفوف المتشابهة لتطبيق دوال مثل COUNT و SUM.' }
]

// correct = رقم الخيار الصحيح (يبدأ من 0)
export const defaultQuestions = [
  { id: 'q1', q: 'أي أمر يستخدم لحذف جدول بالكامل؟', options: ['DELETE', 'DROP TABLE', 'REMOVE', 'CLEAR'], correct: 1 },
  { id: 'q2', q: 'أي كلمة تستخدم لفلترة نتائج GROUP BY؟', options: ['WHERE', 'FILTER', 'HAVING', 'LIMIT'], correct: 2 },
  { id: 'q3', q: 'أي دالة تعد عدد الصفوف؟', options: ['SUM', 'COUNT', 'TOTAL', 'AVG'], correct: 1 }
]

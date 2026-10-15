export const defaultSubjects = [
  { id: 's1', name: 'أساسيات البرمجة' },
  { id: 's2', name: 'قواعد البيانات' }
]

export const defaultCards = [
  { id: 'c1', subjectId: 's2', q: 'شو هو PRIMARY KEY؟', a: 'عمود يحدد كل صف بشكل فريد ولا يقبل NULL.' },
  { id: 'c2', subjectId: 's2', q: 'شو وظيفة GROUP BY؟', a: 'تجميع الصفوف المتشابهة لتطبيق دوال مثل COUNT.' }
]

export const defaultQuestions = [
  { id: 'q1', subjectId: 's2', q: 'أي أمر يستخدم لحذف جدول بالكامل؟', options: ['DELETE', 'DROP TABLE', 'REMOVE', 'CLEAR'], correct: 1 }
]
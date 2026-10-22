import { useState, useEffect } from 'react';

// توليد مصفوفة من النجوم العشوائية لتبدو مثل الصورة تماماً
const NUM_STARS = 200;
const STARS = Array.from({ length: NUM_STARS }, (_, i) => ({
  id: i,
  left: Math.random() * 100, // موقع أفقي عشوائي
  top: Math.random() * 100,  // موقع عمودي عشوائي
  size: Math.random() * 3 + 1, // حجم النجمة بين 1 و 4 بكسل
  delay: Math.random() * 5, // تأخير عشوائي لحركة التلألؤ
  duration: Math.random() * 3 + 2, // سرعة التلألؤ بين 2 و 5 ثواني
  // إعطاء ألوان خفيفة متفرقة (أبيض، أزرق فاتح، أصفر فاتح) لزيادة الواقعية
  color: ['#ffffff', '#e0f7fa', '#fff9c4'][Math.floor(Math.random() * 3)]
}));

export default function Intro({ onEnter }) {
  const [started, setStarted] = useState(false);
  useEffect(() => {
    if (started) {
      const timer = setTimeout(() => {
        const bgVideo = document.getElementById('bg-video');
        if (bgVideo) {
          bgVideo.muted = false; // تفعيل الصوت
          // استخدام catch لتجنب أي أخطاء إذا منع المتصفح التشغيل
          bgVideo.play().catch(err => console.log('تعذر تشغيل الفيديو:', err)); 
        }
        onEnter(); // الدخول للموقع تلقائياً
      }, 2000); // 1000 تعني 1 ثانية، يمكنك تغييرها لأي رقم (مثلاً 4000 لـ 4 ثوانٍ)

      return () => clearTimeout(timer); // تنظيف العداد
    }
  }, [started, onEnter]);



  // دالة زر "ادخلي للموقع"
  const enter = () => {
    onEnter();
  };
  return (
    <div className="new-intro-screen">
      <div className="stars-container">
        {STARS.map(star => (
          <div
            key={star.id}
            className="star"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: star.color,
              boxShadow: `0 0 ${star.size * 2.5}px ${star.color}`, // تأثير التوهج حول النجمة
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`
            }}
          />
        ))}
      </div>


      {/* حاوية قوس قزح والأزرار في المنتصف */}
      <div className="center-content">
        {!started ? (
          <>
            {/* قوس قزح المصمم بـ CSS */}
            <div className="rainbow-wrapper">
              <div className="css-rainbow"></div>
              {/* النصوص المصممة بالكود */}
              <div className="gumball-text-logo">
                <div className="txt-the">The</div>
                <div className="txt-amazing">AMAZING<br />WORLD OF</div>
                <div className="txt-gumball">
                  <span className="c-g">G</span>
                  <span className="c-u">U</span>
                  <span className="c-m">M</span>
                  <span className="c-b">B</span>
                  <span className="c-a">A</span>
                  <span className="c-l1">L</span>
                  <span className="c-l2">L</span>
                </div>
              </div>
            </div>
            <button className="primary intro-btn" onClick={() => setStarted(true)}>
              🎬 ابدأ المغامرة
            </button>
          </>
        ) : (
          <div className="uploads-wrapper">
            <div className="txt-the-word">THE</div>
            <div className="txt-uploads-word">STUDY</div>
          </div>)}
      </div>
    </div>
  );

}
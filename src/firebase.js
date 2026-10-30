import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDoJxf5MerFsKRQ1bjnfVqSRuLPAV6mIj4",
  authDomain: "elmore-study-site.firebaseapp.com",
  projectId: "elmore-study-site",
  storageBucket: "elmore-study-site.firebasestorage.app",
  messagingSenderId: "32822944674",
  appId: "1:32822944674:web:b2c079bcf8a3f814a688fb",
  measurementId: "G-CSQ955L6N7"
};

// تشغيل فايربيز
const app = initializeApp(firebaseConfig);
// تصدير قاعدة البيانات لنستخدمها في باقي الموقع
export const db = getFirestore(app);
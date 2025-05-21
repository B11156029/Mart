import { initializeApp } from "firebase/app";
import { getDatabase, ref, remove } from "firebase/database";

// Firebase 設定（請填入你的專案設定）
const firebaseConfig = {
    apiKey: "AIzaSyBdpDe32VGIgI4jm3qCixYmLshe1J84D6Y",
    authDomain: "myproject-c6a8b.firebaseapp.com",
    projectId: "myproject-c6a8b",
    storageBucket: "myproject-c6a8b.firebasestorage.app",
    messagingSenderId: "683127505459",
    appId: "1:683127505459:web:9eb8eefba788cafbda5946",
    measurementId: "G-QREJXQHYYF"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 刪除整個 Firebase Realtime Database
remove(ref(db, '/'))
  .then(() => {
    console.log("🔥 整個資料庫已成功刪除！");
  })
  .catch((error) => {
    console.error("刪除失敗:", error);
  });

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getDatabase, ref, get, onValue } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBdpDe32VGIgI4jm3qCixYmLshe1J84D6Y",
    authDomain: "myproject-c6a8b.firebaseapp.com",
    projectId: "myproject-c6a8b",
    storageBucket: "myproject-c6a8b.firebasestorage.app",
    messagingSenderId: "683127505459",
    appId: "1:683127505459:web:9eb8eefba788cafbda5946",
    measurementId: "G-QREJXQHYYF"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- 關鍵修改：直接指定帳號，不再從 localStorage 獲取 ---
// 請在這裡直接填入你資料庫中的帳號 ID
const account_number = "你的帳號ID"; 

// 移除所有 window.location.href 跳轉邏輯
const userRef = ref(db, "user/" + account_number);

// 獲取使用者資料
get(userRef).then((snapshot) => {
    if (snapshot.exists()) {
        const userData = snapshot.val();
        console.log("資料讀取成功:", userData);
    } else {
        console.log("找不到該 ID 的資料:", account_number);
    }
}).catch((error) => {
    console.error("獲取資料錯誤 (請檢查資料庫規則):", error);
});

// 獲取並即時監聽 name 值
const nameRef = ref(db, "user/" + account_number + "/name");

onValue(nameRef, (snapshot) => {
    if (snapshot.exists()) {
        const name = snapshot.val();
        // 確保你的 HTML 裡有這個 id 的元件
        const displayElement = document.getElementById('name-display');
        if (displayElement) {
            displayElement.textContent = name;
        }
        console.log("即時獲取的 name 值:", name);
    } else {
        console.log("name 值不存在");
    }
}, (error) => {
    console.error("即時監聽錯誤:", error);
});
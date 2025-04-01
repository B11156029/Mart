import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
import { editPrice } from "./editPrice.js"; // 確保 `editPrice.js` 內已正確定義 `editPrice`

const firebaseConfig = {
    apiKey: "AIzaSyBdpDe32VGIgI4jm3qCixYmLshe1J84D6Y",
    authDomain: "myproject-c6a8b.firebaseapp.com",
    projectId: "myproject-c6a8b",
    storageBucket: "myproject-c6a8b.firebasestorage.app",
    messagingSenderId: "683127505459",
    appId: "1:683127505459:web:9eb8eefba788cafbda5946",
    measurementId: "G-QREJXQHYYF"
};

try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // 將Firebase實例設置為全局變量，以便在main.html中使用
    window.firestore = db;

    const account_number = localStorage.getItem("account_number");

    if (!account_number) {
        window.location.href = "login.html";
    } else {
        const userRef = doc(db, "users", account_number);
        getDoc(userRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    console.log("✅ 使用者已登入:", snapshot.data());
                    
                    // 獲取使用者名稱並顯示
                    const userData = snapshot.data();
                    const nameDisplay = document.getElementById('name-display');
                    if (nameDisplay && userData.name) {
                        nameDisplay.textContent = userData.name;
                        console.log("✅ 獲取的 name 值:", userData.name);
                    } else if (!nameDisplay) {
                        console.warn("⚠️ 找不到 'name-display' 元素");
                    } else {
                        console.warn("⚠️ name 值未找到");
                    }
                } else {
                    console.warn("⚠️ 使用者資料未找到");
                    localStorage.removeItem("account_number");
                    window.location.href = "login.html";
                }
            })
            .catch((error) => {
                console.error("獲取使用者資料時發生錯誤:", error);
                localStorage.removeItem("account_number");
                window.location.href = "login.html";
            });
    }
} catch (error) {
    console.error(" Firebase 初始化失敗:", error);
    alert("網站初始化失敗，請稍後再試。");
}
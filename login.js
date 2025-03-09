import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js";

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

document.getElementById("submit-btn").addEventListener('click', async function(e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        // 從 Firebase 資料庫中獲取使用者資料
        const userRef = ref(db, 'user/' + username);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
            const userData = snapshot.val();
            if (userData.password === password) {
                // 登入成功
                alert("Login successful!");
                window.location.href = "https://b11156029.github.io/PX-Mart/main.html";
            } else {
                // 密碼錯誤
                alert("Login failed: Incorrect password.");
            }
        } else {
            // 使用者不存在
            alert("Login failed: User not found.");
        }
    } catch (error) {
        // 登入失敗
        console.error("Login error:", error);
        alert("Login failed: An error occurred.");
    }
});
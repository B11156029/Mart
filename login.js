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

document.getElementById("submit-btn").addEventListener("click", async function(e) {
    e.preventDefault();

    const account_number = document.getElementById("account_number").value;
    const password = document.getElementById("password").value;

    try {
        const userRef = ref(db, 'user/' + account_number);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
            const userData = snapshot.val();
            if (userData.password === password) {
                alert("登入成功！");
                localStorage.setItem("account_number", account_number); // 🔹 存入 LocalStorage
                window.location.href = "main.html";
            } else {
                alert("登入失敗：密碼錯誤。");
            }
        } else {
            alert("登入失敗：使用者不存在。");
        }
    } catch (error) {
        console.error("登入錯誤：", error);
        alert("登入失敗：發生錯誤。");
    }
});
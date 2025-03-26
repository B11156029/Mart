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

const account_number = localStorage.getItem("account_number");

if (!account_number) {
    window.location.href = "login.html";
} else {
    const userRef = ref(db, "user/" + account_number);
    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            const userData = snapshot.val();
            console.log("使用者已登入:", userData);
        } else {
            console.log("使用者資料未找到");
            localStorage.removeItem("account_number");
            window.location.href = "login.html";
        }
    }).catch((error) => {
        console.error("獲取使用者資料時發生錯誤:", error);
        localStorage.removeItem("account_number");
        window.location.href = "login.html";
    });

    // 獲取 Realtime Database 中的 name 值
    const nameRef = ref(db, "user/" + account_number + "/name");

    onValue(nameRef, (snapshot) => {
        if (snapshot.exists()) {
            const name = snapshot.val();
            document.getElementById('name-display').textContent = name;
            console.log("獲取的 name 值:", name);
        } else {
            console.log("name 值未找到");
        }
    }, (error) => {
        console.error("獲取 name 值時發生錯誤:", error);
    });
}
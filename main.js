import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getFirestore, doc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDuNN0sGP4AaOe0ZoEX3liiA0ZMPr4myGY",
    authDomain: "cart-75759.firebaseapp.com",
    projectId: "cart-75759",
    storageBucket: "cart-75759.firebasestorage.app",
    messagingSenderId: "52529150826",
    appId: "1:52529150826:web:fb5c117d824b70867cc313",
    measurementId: "G-E35KRT7F04"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const account_number = localStorage.getItem("account_number");

if (!account_number) {
    window.location.href = "login.html";
} else {
    // 修改這裡：確保集合名稱正確，並添加錯誤處理
    const userRef = doc(db, "users", account_number); // 注意：集合名稱可能是 "users" 而不是 "user"
    
    getDoc(userRef)
        .then((docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                console.log("使用者已登入:", userData);
                
                // 獲取並顯示用戶名稱
                if (userData.name) {
                    document.getElementById('name-display').textContent = userData.name;
                    console.log("獲取的 name 值:", userData.name);
                } else {
                    console.log("name 值未找到");
                }
            } else {
                console.log("使用者資料未找到");
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
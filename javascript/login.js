import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";

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

document.getElementById("submit-btn").addEventListener("click", async function (e) {
  e.preventDefault();

  const account_number = document.getElementById("account_number").value.trim();
  const password = document.getElementById("password").value;

  try {
    const userDocRef = doc(db, "users", account_number); // ← ✅ 改成正確的 collection 名稱
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      console.log("👤 使用者資料：", userData);

      if (userData.password === password) {
        alert("登入成功！");
        localStorage.setItem("account_number", account_number);
        window.location.href = "../main.html";
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

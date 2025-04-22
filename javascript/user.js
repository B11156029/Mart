import { initializeApp }              from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getFirestore, doc, getDoc }  from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";

/* === 1. Firebase 設定 === */
const firebaseConfig = {
  apiKey: "AIzaSyBdpDe32VGIgI4jm3qCixYmLshe1J84D6Y",
  authDomain: "myproject-c6a8b.firebaseapp.com",
  databaseURL: "https://myproject-c6a8b-default-rtdb.firebaseio.com",
  projectId: "myproject-c6a8b",
  storageBucket: "myproject-c6a8b.firebasestorage.app",
  messagingSenderId: "683127505459",
  appId: "1:683127505459:web:9eb8eefba788cafbda5946",
  measurementId: "G-QREJXQHYYF"
};
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

/* === 2. 取得登入帳號 === */
const account_number = localStorage.getItem("account_number");
if (!account_number) {
  alert("請先登入！");
  location.href = "/html/login.html";
  throw new Error("尚未登入，導向 login.html");
}

/* === 3. 抓取 Firestore -> users/{account_number} === */
(async () => {
  try {
    const userRef  = doc(db, "users", account_number);
    const docSnap  = await getDoc(userRef);

    if (!docSnap.exists()) {
      throw new Error("找不到使用者文件");
    }

    // 取出需要的欄位，給預設值防呆
    const {
      name   = "匿名",
      level  = "一般會員",
      points = 0
    } = docSnap.data();

    /* === 4. 塞進畫面 === */
    document.getElementById("user-name")      .textContent = name;
    document.getElementById("profile-level")  .textContent = level;
    document.getElementById("profile-points") .textContent = points.toLocaleString();

  } catch (err) {
    console.error("讀取使用者資料失敗:", err);
    localStorage.removeItem("account_number");
    location.href = "/html/login.html";
  }
})();

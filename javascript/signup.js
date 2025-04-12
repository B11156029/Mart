import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";

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

document.getElementById("submit").addEventListener('click', async function(e) {
  e.preventDefault();

  const account_number = document.getElementById("account_number").value.trim();
  const name = document.getElementById("name").value.trim();
  const password = document.getElementById("password").value.trim();
  const compasswd = document.getElementById("compasswd").value.trim();

  console.log("Form data:", { account_number, name, password, compasswd });

  if (!account_number || !name || !password || !compasswd) {
    alert("請填寫所有欄位。");
    return;
  }

  const lowercaseRegex = /[a-z]/;
  const uppercaseRegex = /[A-Z]/;
  const numberRegex = /[0-9]/;
  const specialCharRegex = /[!@#$%^&*()\-_=+{};:,<.>]/;

  let conditionsMet = 0;
  if (lowercaseRegex.test(password)) conditionsMet++;
  if (uppercaseRegex.test(password)) conditionsMet++;
  if (numberRegex.test(password)) conditionsMet++;
  if (specialCharRegex.test(password)) conditionsMet++;

  if (password.length < 8 || conditionsMet < 2) {
    alert("密碼至少需要8位，並包含以下條件中的兩種：小寫字母、大寫字母、數字、特殊字元");
    return;
  }

  if (password !== compasswd) {
    alert("兩次輸入的密碼不一致。");
    return;
  }

  try {
    await setDoc(doc(db, "users", account_number), {
      name: name,
      account_number: account_number,
      password: password
    });
    alert("帳戶創建成功！");
    window.location.href = "login.html";
  } catch (error) {
    console.error("Firestore 寫入錯誤:", error);
    alert("帳戶創建失敗，請重試。");
  }
});

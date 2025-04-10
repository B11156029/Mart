import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js";

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

document.getElementById("submit").addEventListener('click', async function(e) {
    e.preventDefault();

    const account_number = document.getElementById("account_number").value.trim();
    const name = document.getElementById("name").value.trim();
    const password = document.getElementById("password").value.trim();
    const compasswd = document.getElementById("compasswd").value.trim();

    if (!account_number || !name || !password || !compasswd) {
        alert("Please fill in all fields.");
        return;
    }

    if (password !== compasswd) {
        alert("Passwords do not match.");
        return;
    }

    try {
        await set(ref(db, 'user/' + account_number), {
            name: name,
            account_number: account_number,
            password: password
        });
        alert("Account created successfully!");
        window.location.href = "login.html"; // Redirect to login page
    } catch (error) {
        console.error("Error writing data:", error);
        alert("Account creation failed. Please try again.");
    }
});
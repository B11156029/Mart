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

    const username = document.getElementById("username").value;
    const name = document.getElementById("name").value;
    const password = document.getElementById("password").value;
    const compasswd = document.getElementById("compasswd").value;

    if (password !== compasswd) {
        alert("Passwords do not match.");
        return;
    }

    try {
        await set(ref(db, 'user/' + username), {
            username: username,
            name: name,
            password: password
        });
        alert("Account created successfully!");
        window.location.href = "login.html"; // Redirect to login page
    } catch (error) {
        console.error("Error writing data:", error);
        alert("Account creation failed. Please try again.");
    }
});
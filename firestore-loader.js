// firestore-loader.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";

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
let lastVisible = null;

export async function loadNextBatch(appInstance, batchSize = 30) {
  try {
    let q = query(collection(db, "products"), orderBy("name"), limit(batchSize));

    if (lastVisible) {
      q = query(collection(db, "products"), orderBy("name"), startAfter(lastVisible), limit(batchSize));
    }

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const newProducts = snapshot.docs.map(doc => {
        const data = doc.data();
        data.docId = doc.id;
        return data;
      });

      appInstance.products.push(...newProducts);
      appInstance.visibleProducts.push(...newProducts);
      appInstance.currentIndex += newProducts.length;

      lastVisible = snapshot.docs[snapshot.docs.length - 1];
    } else {
      appInstance.reachedEnd = true;
    }
  } catch (error) {
    console.error("載入商品時出錯:", error);
  }
}

export { db };

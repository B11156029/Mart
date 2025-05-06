const token = "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"; // ⛔ 請替換為你自己的 GitHub Token
const owner = "B11156029";
const repo = "Mart";
const path = "main.json";
const branch = "main";

let jsonArray = [];
let currentItemIndex = -1;

function setStatus(msg, isError = false) {
  const el = document.getElementById("status");
  el.textContent = msg;
  el.style.color = isError ? "red" : "green";
}

async function loadData() {
  const barcode = document.getElementById("barcode").value.trim();
  if (!barcode) return setStatus("❌ 請輸入 barcode", true);

  setStatus("🔄 正在載入 JSON...");
  try {
    const metaRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" }
    });
    const meta = await metaRes.json();
    const rawRes = await fetch(meta.download_url);
    jsonArray = await rawRes.json();
    currentItemIndex = jsonArray.findIndex(obj => obj.barcode === barcode);

    if (currentItemIndex === -1) return setStatus("❌ 找不到對應 barcode", true);

    const item = jsonArray[currentItemIndex];
    document.getElementById("edit-barcode").value = item.barcode || "";
    document.getElementById("edit-barcode").disabled = true;
    document.getElementById("name").value = item.name || "";
    document.getElementById("image").value = item.image || "";
    document.getElementById("price").value = item.price || "";
    document.getElementById("description").value = item.description || "";
    document.getElementById("specialOffers").value = JSON.stringify(item.specialOffers || {});

    document.getElementById("form-area").style.display = "block";
    setStatus("✅ 資料載入完成！");
    window.meta = meta;
  } catch (err) {
    setStatus("❌ 載入失敗：" + err.message, true);
  }
}

function newItem() {
  currentItemIndex = -2;
  document.getElementById("edit-barcode").value = "";
  document.getElementById("edit-barcode").disabled = false;
  document.getElementById("name").value = "";
  document.getElementById("image").value = "";
  document.getElementById("price").value = "";
  document.getElementById("description").value = "";
  document.getElementById("specialOffers").value = JSON.stringify({ "1": 36, "2": 68 });

  document.getElementById("form-area").style.display = "block";
  setStatus("🆕 請輸入新商品資料");
}

async function saveData() {
  const barcode = document.getElementById("edit-barcode").value.trim();
  if (!barcode) return setStatus("❌ Barcode 為必填欄位", true);

  try {
    const updatedItem = {
      barcode,
      name: document.getElementById("name").value,
      image: document.getElementById("image").value,
      price: document.getElementById("price").value,
      description: document.getElementById("description").value,
      specialOffers: JSON.parse(document.getElementById("specialOffers").value)
    };

    if (currentItemIndex === -2) {
      if (jsonArray.some(item => item.barcode === barcode)) {
        return setStatus("❌ 此 barcode 已存在，請使用不同條碼", true);
      }
      jsonArray.push(updatedItem);
    } else if (currentItemIndex >= 0) {
      jsonArray[currentItemIndex] = updatedItem;
    } else {
      return setStatus("❌ 尚未載入資料", true);
    }

    const updatedContent = btoa(unescape(encodeURIComponent(JSON.stringify(jsonArray, null, 2))));
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `📦 ${currentItemIndex === -2 ? "新增" : "更新"} ${updatedItem.barcode} 商品資料`,
        content: updatedContent,
        sha: window.meta.sha,
        branch
      })
    });

    if (res.ok) {
      setStatus("✅ 儲存成功！");
    } else {
      const err = await res.json();
      setStatus("❌ 儲存失敗：" + err.message, true);
    }
  } catch (err) {
    setStatus("❌ 發生錯誤：" + err.message, true);
  }
}

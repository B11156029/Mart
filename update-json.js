const fetch = require("node-fetch");
const fs = require("fs");

const token = process.env.GITHUB_TOKEN;
const owner = "B11156029";
const repo = "Mart";
const path = "main.json";
const branch = "main";

const targetBarcode = process.argv[2]; // 從命令列取得 barcode
if (!targetBarcode) {
  console.error("❌ 請輸入 barcode，例如：node update-json.js 123456789");
  process.exit(1);
}

(async () => {
  try {
    // 取得檔案 Meta 資訊（包含 sha）
    const metaRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    const meta = await metaRes.json();

    // 取得原始 JSON
    const rawRes = await fetch(meta.download_url);
    const jsonArray = await rawRes.json();

    // 尋找或新增商品
    let index = jsonArray.findIndex((obj) => obj.barcode === targetBarcode);
    const newItem = {
      barcode: targetBarcode,
      name: "測試商品",
      image: "https://example.com/image.jpg",
      price: "99",
      description: "這是一個測試商品",
      specialOffers: { "1": 36, "2": 68 },
    };

    if (index === -1) {
      jsonArray.push(newItem);
      console.log("🆕 新增商品成功！");
    } else {
      jsonArray[index] = newItem;
      console.log("✏️ 更新商品成功！");
    }

    // 更新檔案內容
    const updatedContent = Buffer.from(JSON.stringify(jsonArray, null, 2)).toString("base64");
    const updateRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `📦 更新/新增 ${targetBarcode} 商品資料`,
        content: updatedContent,
        sha: meta.sha,
        branch,
      }),
    });

    if (updateRes.ok) {
      console.log("✅ JSON 儲存成功！");
    } else {
      const err = await updateRes.json();
      console.error("❌ 儲存失敗：", err.message);
    }
  } catch (err) {
    console.error("❌ 發生錯誤：", err.message);
  }
})();

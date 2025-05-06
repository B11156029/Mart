const fetch = require("node-fetch");
const fs = require("fs");

const token = "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"; // ❗注意不能寫死！建議使用 process.env
const owner = "B11156029";
const repo = "Mart";
const path = "main.json";
const branch = "main";

const [barcode, name, image, price, description, specialOffersRaw] = process.argv.slice(2);

const newItem = {
  barcode,
  name,
  image,
  price,
  description,
  specialOffers: JSON.parse(specialOffersRaw),
};

(async () => {
  try {
    const metaRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" },
    });
    const meta = await metaRes.json();

    const rawRes = await fetch(meta.download_url);
    const jsonArray = await rawRes.json();

    const index = jsonArray.findIndex(item => item.barcode === barcode);
    if (index === -1) {
      jsonArray.push(newItem);
      console.log("🆕 新增商品！");
    } else {
      jsonArray[index] = newItem;
      console.log("🔄 更新商品！");
    }

    const updatedContent = Buffer.from(JSON.stringify(jsonArray, null, 2)).toString("base64");

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `📦 更新商品 ${barcode}`,
        content: updatedContent,
        sha: meta.sha,
        branch,
      }),
    });

    if (res.ok) {
      console.log("✅ 更新成功！");
    } else {
      const err = await res.json();
      console.error("❌ 儲存失敗：", err.message);
    }
  } catch (err) {
    console.error("❌ 發生錯誤：", err.message);
  }
})();

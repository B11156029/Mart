const fs = require("fs");

const input = JSON.parse(fs.readFileSync("input.json", "utf-8"));
const main = JSON.parse(fs.readFileSync("main.json", "utf-8"));

const { barcode, name, image, price, description, specialOffers } = input;

const newItem = { barcode, name, image, price, description, specialOffers };
const index = main.findIndex(item => item.barcode === barcode);

if (index === -1) {
  main.push(newItem);
  console.log("🆕 新增商品");
} else {
  main[index] = newItem;
  console.log("🔄 更新商品");
}

fs.writeFileSync("main.json", JSON.stringify(main, null, 2));

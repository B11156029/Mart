import json
import re

# 讀取本地檔案
with open("豐富鍋底.json", "r", encoding="utf-8") as infile:
    data = json.load(infile)

def update_item(item):
    # 確認 'description' 欄位是否存在
    if "description" not in item:
        item["specialOffers"] = {"1": int(item["price"].replace("NT$", "").replace(",", "").strip())}
        return item

    # 移除 'NT$', 逗號 並轉換為整數
    price = int(item["price"].replace("NT$", "").replace(",", "").strip())

    # 使用正則表達式提取優惠資訊
    match = re.search(r"任(\d+)件(\d+)元", item["description"])
    if match:
        quantity, offer_price = map(int, match.groups())
        item["specialOffers"] = {
            "1": price,
            str(quantity): offer_price
        }
    else:
        item["specialOffers"] = {"1": price}  # 沒有優惠時的情況
    
    return item

# 更新所有項目
updated_data = [update_item(item) for item in data]

# 將結果寫入本地檔案
with open("豐富鍋底.json", "w", encoding="utf-8") as outfile:
    json.dump(updated_data, outfile, ensure_ascii=False, indent=4)

print("資料處理完成")

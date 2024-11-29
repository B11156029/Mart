import json

# 本地檔案路徑
file_path = "糖果零食.json"  # 確保此檔案與程式放在同一資料夾，或提供完整路徑

# 從本地檔案讀取 JSON 資料
with open(file_path, "r", encoding="utf-8") as file:
    data = json.load(file)

# 定義「買一送一」邏輯，設定兩個價格相同
def apply_bogo_discount_fixed(item):
    if "price" in item:
        # 移除 "NT$" 並轉換價格為整數
        price = int(item["price"].replace("NT$", "").strip())
        # 更新特價資訊為相同價格
        item["specialOffers"] = {
            "1": price,
            "2": price  # 與原價相同
        }
    return item

# 對資料進行處理
updated_data_fixed = [apply_bogo_discount_fixed(item) for item in data]

# 將更新後的資料存回新的本地檔案
output_path_fixed = "糖果零食.json"
with open(output_path_fixed, "w", encoding="utf-8") as file:
    json.dump(updated_data_fixed, file, ensure_ascii=False, indent=4)

print(f"已成功更新檔案，儲存於：{output_path_fixed}")

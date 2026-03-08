import json
import os

# 讀取原始資料
input_file = "新增類別.json"
output_file = "新增類別1.json"

if os.path.exists(input_file):
    with open(input_file, "r", encoding="utf-8") as infile:
        data = json.load(infile)
else:
    print(f"找不到檔案 {input_file}，創建新的資料。")
    data = []

# 新增 attributes 屬性到每筆商品資料
for item in data:
    item["attributes"] = ["new"]

# 寫入輸出檔案
with open(output_file, "w", encoding="utf-8") as outfile:
    json.dump(data, outfile, ensure_ascii=False, indent=4)

print(f"資料已成功更新並儲存至 {output_file}")

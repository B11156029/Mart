import os

# 設定輸入與輸出檔案路徑
input_path = os.path.join(os.getcwd(), "新品.csv")  # 讀取當前目錄下的檔案
output_path = os.path.join(os.getcwd(), "新品.csv")  # 轉換後的檔案路徑

# 讀取原始 CSV 檔案（假設為 UTF-8 編碼）
with open(input_path, "r", encoding="utf-8") as f:
    content = f.read()

# 以 UTF-8 BOM 編碼寫入新檔案，確保 Excel 正確讀取
with open(output_path, "w", encoding="utf-8-sig") as f:
    f.write(content)

print(f"轉換完成！請至以下路徑查看修正後的 CSV 檔案：\n{output_path}")

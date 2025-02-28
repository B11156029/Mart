import pandas as pd
import chardet

# 自動偵測 CSV 檔案的編碼格式
def detect_encoding(file_path):
    with open(file_path, "rb") as f:
        result = chardet.detect(f.read(10000))  # 讀取部分內容進行編碼偵測
    return result["encoding"]

# 設定檔案名稱
csv1_file = "主檔.csv"  # 原始主檔
csv2_file = "更新檔.csv"  # 更新檔

# 偵測 CSV 編碼
encoding1 = detect_encoding(csv1_file)
encoding2 = detect_encoding(csv2_file)

print(f"偵測到 {csv1_file} 的編碼為: {encoding1}")
print(f"偵測到 {csv2_file} 的編碼為: {encoding2}")

# 讀取 CSV（確保使用正確的編碼）
csv1 = pd.read_csv(csv1_file, encoding=encoding1)
csv2 = pd.read_csv(csv2_file, encoding=encoding2)

# 設定 id 欄位為索引，以便更新
csv1.set_index("id", inplace=True)
csv2.set_index("id", inplace=True)

# 更新 csv1 的資料
csv1.update(csv2)

# 如果希望新增 csv2 中原本不在 csv1 的記錄，則合併它們
csv1 = csv1.combine_first(csv2).reset_index()

# 存回更新後的 CSV（保持原本的編碼）
updated_file = "更新後主檔.csv"
csv1.to_csv(updated_file, index=False, encoding=encoding1)

print(f"CSV 更新完成，結果已存入 {updated_file}")

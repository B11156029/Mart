import pandas as pd

# 讀取 CSV 檔案
csv1 = pd.read_csv("csv1.csv")
csv2 = pd.read_csv("csv2.csv")

# 使用 `id` 欄位作為鍵來更新 csv1 的數據
csv1.set_index("id", inplace=True)  # 設定索引為 id
csv2.set_index("id", inplace=True)

# 更新 csv1 內容（只更新 csv2 有的欄位）
csv1.update(csv2)

# 若要新增 csv2 中的未出現在 csv1 的 id，可合併兩個 DataFrame
csv1 = csv1.combine_first(csv2).reset_index()

# 存回 CSV
csv1.to_csv("updated_csv1.csv", index=False)

print("CSV 更新完成，結果已存入 updated_csv1.csv")

import pandas as pd
import requests
import os
from urllib.parse import urlparse

# 載入 CSV 檔案
csv_file = "全部商品.csv"  # 替換為你的 CSV 檔案名稱
output_folder = "downloaded_images"

# 建立儲存圖片的資料夾
os.makedirs(output_folder, exist_ok=True)

# 從 CSV 中讀取資料
data = pd.read_csv(csv_file)

# 確保資料中有 'image' 和 'name' 欄位
if "image" not in data.columns or "name" not in data.columns:
    print("CSV 檔案缺少 'image' 或 'name' 欄位！")
else:
    # 遍歷資料，下載圖片並重新命名
    for index, row in data.iterrows():
        image_url = row['image']
        filename = row['name']
        
        # 確保檔案名安全
        filename = "".join(c if c.isalnum() or c in " ._-" else "_" for c in filename)

        # 從 URL 推斷副檔名
        parsed_url = urlparse(image_url)
        extension = os.path.splitext(parsed_url.path)[1]
        if not extension:
            extension = ".jpg"  # 預設副檔名

        # 確保檔案名稱唯一
        file_path = os.path.join(output_folder, f"{filename}{extension}")
        counter = 1
        while os.path.exists(file_path):
            file_path = os.path.join(output_folder, f"{filename}_{counter}{extension}")
            counter += 1

        try:
            response = requests.get(image_url, timeout=10)  # 加入超時設定
            response.raise_for_status()  # 檢查請求是否成功
            with open(file_path, "wb") as file:
                file.write(response.content)
            print(f"已成功下載並儲存: {file_path}")
        except requests.exceptions.RequestException as e:
            print(f"下載失敗: {image_url}, 錯誤原因: {e}")
        except Exception as e:
            print(f"處理失敗: {filename}, 錯誤原因: {e}")

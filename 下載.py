import pandas as pd
import requests
import os
from urllib.parse import urlparse
from concurrent.futures import ThreadPoolExecutor, as_completed

# 載入 CSV 檔案
csv_file = "失敗的.csv"  # 替換為你的 CSV 檔案名稱
output_folder = "失敗二次的"  # 圖片儲存資料夾
failed_downloads_file = "失敗3次的.csv"  # 設定下載失敗資料的檔案名稱

# 建立儲存圖片的資料夾
os.makedirs(output_folder, exist_ok=True)

# 從 CSV 中讀取資料
data = pd.read_csv(csv_file, encoding='utf-8-sig')  # 確保正確編碼讀取

# 確保資料中有 'image' 欄位
if "image" not in data.columns:
    print("CSV 檔案缺少 'image' 欄位！")
else:
    # 如果失敗記錄檔不存在，則寫入標題
    if not os.path.exists(failed_downloads_file):
        pd.DataFrame(columns=["name", "image_url", "error"]).to_csv(
            failed_downloads_file, index=False, encoding="utf-8"
        )

    # 下載圖片的函式 (不再使用 name 作為檔名)
    def download_image(image_url):
        # 從 URL 中取得圖片的原始檔名
        parsed_url = urlparse(image_url)
        filename = os.path.basename(parsed_url.path) or "default.jpg"  # 預設檔名

        file_path = os.path.join(output_folder, filename)

        try:
            response = requests.get(image_url, timeout=100)  # 加入超時設定
            response.raise_for_status()  # 檢查請求是否成功
            with open(file_path, "wb") as file:
                file.write(response.content)
            return None  # 下載成功
        except requests.exceptions.RequestException as e:
            error_info = {"name": filename, "image_url": image_url, "error": f"下載失敗, 錯誤原因: {e}"}
        except Exception as e:
            error_info = {"name": filename, "image_url": image_url, "error": f"處理失敗, 錯誤原因: {e}"}

        # 立即將失敗的下載資訊寫入 CSV
        pd.DataFrame([error_info]).to_csv(failed_downloads_file, mode="a", index=False, header=False, encoding="utf-8")
        return error_info

    # 使用多線程下載圖片
    max_workers = 20  # 設定最大線程數
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # 提交所有下載任務
        futures = {executor.submit(download_image, row['image']): row for _, row in data.iterrows()}

        # 逐一取得完成的結果
        for future in as_completed(futures):
            result = future.result()
            if result:
                print(f"下載失敗: {result}")  # 即時顯示失敗的圖片資訊

    print("下載完成！")

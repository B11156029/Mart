import os
import pandas as pd

def merge_csv_in_folder(folder_path, output_file):
    """
    合併指定資料夾內的所有 CSV 檔案並輸出為一個新的 CSV 檔案。
    :param folder_path: 要合併 CSV 的資料夾路徑
    :param output_file: 合併後的輸出 CSV 檔案名稱
    """
    all_files = [f for f in os.listdir(folder_path) if f.endswith('.csv')]
    
    if not all_files:
        print("該資料夾內沒有 CSV 檔案。")
        return
    
    df_list = []
    for file in all_files:
        file_path = os.path.join(folder_path, file)
        df = pd.read_csv(file_path)
        df["source_file"] = file  # 添加來源檔案欄位，方便追蹤
        df_list.append(df)
    
    merged_df = pd.concat(df_list, ignore_index=True)
    merged_df.to_csv(output_file, index=False)
    print(f"合併完成！輸出檔案: {output_file}")

# 使用範例
folder = "csv檔案"  # 替換為你的資料夾路徑
output = "final.csv"  # 輸出檔案名稱
merge_csv_in_folder(folder, output)
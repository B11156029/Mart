import json
import os

def merge_json_from_directory(directory, output_file):
    merged_data = []
    
    for filename in os.listdir(directory):
        if filename.endswith('.json'):
            file_path = os.path.join(directory, filename)
            with open(file_path, 'r', encoding='utf-8') as f:
                merged_data.extend(json.load(f))
    
    with open(output_file, 'w', encoding='utf-8') as out:
        json.dump(merged_data, out, ensure_ascii=False, indent=2)
    
    print(f"Merged JSON saved to {output_file}")

# 使用範例
directory = 'TODAY'  # 指定存放 JSON 檔案的資料夾
merge_json_from_directory(directory, 'TODAY.json')

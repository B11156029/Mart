import csv
import json

def csv_to_json(csv_file, json_file):
    data = []
    
    with open(csv_file, mode='r', encoding='utf-8-sig') as file:
        reader = csv.DictReader(file)
        for row in reader:
            data.append({
                "name": row["name"].strip(),
                "image": row["image"].strip(),
                "price": row["price"].strip(),
                "barcode": row["barcode"].strip(),
                "description": row["description"].strip(),
                
            })
    
    with open(json_file, mode='w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=4)

# Example usage
csv_to_json('全部商品.csv', 'maintest.json')

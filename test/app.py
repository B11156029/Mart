import requests
import json

# Google App Script的Web應用URL
url = "https://script.google.com/macros/s/AKfycbwRlc7Hxn1Q93RuaWUZtJP4jBxyHpAUEeIxI89dkx_ylwLyfeG-nBtf5ZdTe68Bvgk/exec"

# 要發送的資料
data = {
    "name": "John Doe",
    "username": "john_doe",
    "password": "password123"
}

# 發送POST請求
response = requests.post(url, data=json.dumps(data))
print(response.text)

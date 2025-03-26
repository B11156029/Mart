// 處理更新價格的請求
const fs = require('fs');
const path = require('path');

function handleUpdatePrice(req, res) {
    console.log('收到更新價格請求');
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            console.log('原始請求體:', body);
            const data = JSON.parse(body);
            console.log('解析後參數:', JSON.stringify(data));
            updateProductPrice(data, res);
        } catch (error) {
            console.error('請求解析失敗:', error);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: false, 
                message: '無效的請求數據',
                error: error.message 
            }));
        }
    });
}

// 更新商品價格
function updateProductPrice(data, res) {
    const { productName, newPrice } = data;
    
    // 確保newPrice是有效值，但不強制轉換為數字類型
    if (!productName || newPrice === undefined || newPrice === null || newPrice === '') {
        console.error('参数校验失败:', { productName, newPrice });
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: '参数格式错误，价格不能为空' }));
        return;
    }

    const mainJsonPath = path.join(__dirname, 'main.json');
    console.log('开始更新商品价格:', { productName, newPrice });
    console.log('完整请求参数:', data);
    fs.readFile(mainJsonPath, 'utf8', (err, jsonData) => {
        console.log('文件读取操作完成，错误状态:', err?.message || '无错误');
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: '讀取文件失敗', error: err.message }));
            return;
        }

        try {
            const products = JSON.parse(jsonData);
            const productIndex = products.findIndex(p => p.name === productName);
            
            if (productIndex === -1) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: '找不到指定商品' }));
                return;
            }

            // 更新價格 - 確保轉換為字符串類型
            products[productIndex].price = String(newPrice);
            
            // 如果商品有特價信息，則刪除特價信息，與前端保持一致
            if (products[productIndex].specialOffers) {
                // 刪除特價信息，與前端保持一致
                delete products[productIndex].specialOffers;
            }
            
            // 寫入更新後的數據
            fs.writeFile(mainJsonPath, JSON.stringify(products, null, 4), 'utf8', (writeErr) => {
                if (writeErr) {
                    console.error('文件写入失败:', writeErr);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: '寫入文件失敗', error: writeErr.message }));
                    return;
                }

                console.log('价格更新成功:', { productName, newPrice });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: '價格更新成功' }));
            });
        } catch (parseErr) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: '解析JSON失敗' }));
        }
    });
}

module.exports = handleUpdatePrice;
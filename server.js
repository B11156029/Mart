const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const handleUpdatePrice = require('./handleUpdatePrice');

const PORT = 3003; // 伺服器埠號

// 設定圖片所在目錄
const IMAGE_FOLDER = path.join(__dirname, '新增資料夾');

const server = http.createServer((req, res) => {
    // 設置 CORS 頭，允許跨域請求
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // 預檢請求
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // 解析請求 URL，並進行 URL 解碼
    let parsedUrl = url.parse(req.url, true);
    let pathname = decodeURIComponent(parsedUrl.pathname).replace(/^\/+/, ''); // 解碼並去除 `/`
    console.log('🔍 Requested path:', pathname);

    // 處理 API 請求
    if (req.method === 'POST' && pathname === 'update-price') {
        handleUpdatePrice(req, res);
        return;
    }

    // 轉向 `/login.html` 作為預設頁面
    if (req.method === 'GET') {
        if (pathname === '') {
            res.writeHead(302, { 'Location': '/login.html' });
            res.end();
            return;
        }

        // **處理圖片請求**
        if (pathname.startsWith('images/')) {
            const imagePath = path.join(IMAGE_FOLDER, pathname.replace('images/', ''));
            console.log('🖼 Serving image from:', imagePath);

            if (!fs.existsSync(imagePath)) {
                console.error(`🚫 找不到圖片: ${imagePath}`);
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end(`找不到圖片: ${pathname}`);
                return;
            }

            serveFile(res, imagePath, getContentType(imagePath));
            return;
        }

        // **處理靜態文件請求**
        if (pathname.match(/\.(html|css|js|png|jpg|svg|json)$/)) {
            const filePath = path.join(__dirname, decodeURIComponent(pathname)); // 確保解碼
            console.log('📂 Serving file from:', filePath);

            if (!fs.existsSync(filePath)) {
                console.error(`🚫 找不到文件: ${filePath}`);
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end(`找不到文件: ${pathname}`);
                return;
            }

            serveFile(res, filePath, getContentType(filePath));
            return;
        }

        // 404: 未知請求
        console.error(`❌ 404: 找不到資源 - ${pathname}`);
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Endpoint not found' }));
    }
});

// **提供靜態文件**
function serveFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, content) => {
        if (err) {
            console.error(`伺服器錯誤: ${err.code}`);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end(`伺服器錯誤: ${err.code}`);
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
}

// **取得對應的內容類型**
function getContentType(filePath) {
    const ext = path.extname(filePath).substring(1);
    const contentTypes = {
        'html': 'text/html',
        'css': 'text/css',
        'js': 'text/javascript',
        'json': 'application/json',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'svg': 'image/svg+xml'
    };
    return contentTypes[ext] || 'text/plain';
}

// **啟動伺服器**
server.listen(PORT, () => {
    console.log(`🚀 伺服器運行在 http://localhost:${PORT}`);
});

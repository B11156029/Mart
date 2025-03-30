const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const handleUpdatePrice = require('./handleUpdatePrice');

const PORT = 3003; // 修改端口號避免衝突

// 創建 HTTP 伺服器
const server = http.createServer((req, res) => {
    // 設置 CORS 頭，允許來自任何源的請求
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // 處理預檢請求
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // 解析 URL
    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;

    console.log('Requested path:', pathname);  // 輸出請求的路徑，方便調試

    // 先處理 API 請求
    if (req.method === 'POST' && pathname === '/update-price') {
        handleUpdatePrice(req, res);
        return;
    }

    // 處理靜態文件請求
    if (req.method === 'GET') {
        if (pathname === '/') {
            // 當訪問根路徑時重定向到 login.html
            res.writeHead(302, { 'Location': '/login.html' });
            res.end();
            return;
        }

        // **移除 `/` 開頭，避免路徑錯誤**
        pathname = pathname.replace(/^\/+/, '');

        // 限制只能存取特定類型的檔案，避免存取 server.js
        if (pathname.match(/\.(html|css|js|png|jpg|svg|json)$/)) {
            const extension = path.extname(pathname).substring(1);
            const contentType = getContentType(extension);

            const filePath = path.join(__dirname, pathname);
            console.log('Serving file from:', filePath);  // 輸出要加載的路徑

            serveFile(res, filePath, contentType);
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Endpoint not found' }));
        }
    }
});

// 提供靜態文件
function serveFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                console.error(`找不到文件: ${filePath}`);
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end(`找不到文件: ${filePath}`);
            } else {
                console.error(`服務器錯誤: ${err.code}`);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end(`服務器錯誤: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
}

// 獲取內容類型
function getContentType(extension) {
    const contentTypes = {
        'html': 'text/html',
        'css': 'text/css',
        'js': 'text/javascript',
        'json': 'application/json',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'svg': 'image/svg+xml'
    };
    return contentTypes[extension] || 'text/plain';
}

// 啟動伺服器
server.listen(PORT, () => {
    console.log(`伺服器運行在 http://localhost:${PORT}`);
});

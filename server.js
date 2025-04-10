const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const handleUpdatePrice = require('./handleUpdatePrice');

const PORT = 3002; // 修改端口号避免冲突

// 創建HTTP服務器
const server = http.createServer((req, res) => {
    // 設置CORS頭，允許來自任何源的請求
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // 處理預檢請求
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // 解析URL
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // 先處理API請求
    if (req.method === 'POST' && pathname === '/update-price') {
        handleUpdatePrice(req, res);
        return;
    }

    // 處理靜態文件請求
    if (req.method === 'GET') {
        // 原有靜態文件處理邏輯
        if (pathname === '/' || pathname === '/index.html') {
            serveFile(res, 'main.html', 'text/html');
        } else if (pathname.match(/\.(css|js|png|jpg|svg|json)$/)) {
            const extension = path.extname(pathname).substring(1);
            const contentType = getContentType(extension);
            serveFile(res, pathname.substring(1), contentType);
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Endpoint not found' }));
        }
    }
});

// 獲取本機IP地址
function getLocalIpAddress() {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    const results = {};

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // 跳過非IPv4和內部IP
            if (net.family === 'IPv4' && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    }
    return results;
}

// 啟動服務器
server.listen(PORT, '0.0.0.0', () => {
    const ipAddresses = getLocalIpAddress();
    console.log(`服務器運行在 http://localhost:${PORT}`);
    console.log('可通過以下IP地址從其他設備訪問：');
    for (const [dev, addresses] of Object.entries(ipAddresses)) {
        for (const addr of addresses) {
            console.log(`http://${addr}:${PORT}`);
        }
    }
});

// 提供靜態文件
function serveFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end(`找不到文件: ${filePath}`);
            } else {
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
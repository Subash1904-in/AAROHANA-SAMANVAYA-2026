const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const BASE_DIR = __dirname;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.jpeg': 'image/jpg',
    '.webp': 'image/webp',
    '.webm': 'video/webm',
    '.mp4': 'video/mp4',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);

    if (req.method === 'POST' && req.url === '/api/save_html') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const { filename, html } = data;

                if (!filename || !html) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Missing parameters' }));
                    return;
                }

                // Sanitize filename and construct path securely
                const safeName = path.basename(filename);
                const targetPath = path.join(BASE_DIR, safeName);

                // Ensure we only overwrite HTML files inside the base directory
                if (!targetPath.endsWith('.html')) {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Only HTML edits allowed' }));
                    return;
                }

                // --- Handle Base64 Image Native Upload ---
                if (data.base64Image && data.newImageName) {
                    try {
                        const base64Data = data.base64Image.replace(/^data:image\/\w+;base64,/, "");
                        const imageBuffer = Buffer.from(base64Data, 'base64');
                        const imageDir = path.join(BASE_DIR, 'images', 'events');
                        fs.mkdirSync(imageDir, { recursive: true });
                        const imagePath = path.join(imageDir, data.newImageName);
                        fs.writeFileSync(imagePath, imageBuffer);
                        console.log(`[SUCCESS] Saved new poster natively to: images/events/${data.newImageName}`);
                    } catch(imgErr) {
                        console.error("[ERROR] Could not decode/save image data: ", imgErr);
                    }
                }

                fs.writeFileSync(targetPath, html, 'utf-8');
                console.log(`[SUCCESS] Overwrote: ${safeName}`);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (error) {
                console.error("[ERROR]", error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: error.message }));
            }
        });
        return;
    }

    // Static File Serving
    let rawUrl = req.url.split('?')[0]; // Strip query strings
    rawUrl = decodeURIComponent(rawUrl); // Decode %20 to spaces
    let filePath = path.join(BASE_DIR, rawUrl === '/' ? 'index.html' : rawUrl);
    const extname = path.extname(filePath).toLowerCase();

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            const contentType = mimeTypes[extname] || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    const os = require('os');
    const interfaces = os.networkInterfaces();
    let localIps = [];
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                localIps.push({ name, address: iface.address });
            }
        }
    }

    console.log(`
===================================================
AAROHANA LOCAL CMS SERVER ONLINE
===================================================
Local Access:    http://localhost:${PORT}/`);
    localIps.forEach(ip => {
        console.log(`Network (${ip.name}): http://${ip.address}:${PORT}/`);
    });
    console.log(`
Open one of the Network URLs above on any device to edit!

(Press Ctrl+C to stop)
===================================================`);
});

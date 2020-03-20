var http = require('http');
var fs = require('fs');
var path = require('path');

http.createServer(function (request, response) {
    console.log('request:', request.url);
    console.log('method:', request.method);
    console.log('headers:', request.headers, '\n');

    let mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm',
        '.ico': 'image/x-icon'
    };

  
    let out, contentType, url_parts = [];
    let req_url = request.url;
    let req_url_parts = req_url.split('/');
    let extname = String(path.extname(req_url)).toLowerCase();
    
    req_url_parts.forEach((x) => {
        if (x != '') url_parts.push(x);
    });
    
    
    if (extname == '') {
        url_parts.push('index.html');
        contentType = 'text/html';
    } else {
        contentType = mimeTypes[extname] || 'application/octet-stream';
    }    

    let filePath = './' + url_parts.join('/'); //request.url;
    

    if (request.method == 'GET') {

        switch(url_parts[0]) {

            case 'index.html':
                response.writeHead(200, { 'Content-Type': 'text/html' });
                response.end('hello! this is a very simple server', 'utf-8');
            break;

            case 'favicon.ico':
            case 'static':
                fs.readFile(filePath, function(error, content) {
                    if (error) {
                        if(error.code == 'ENOENT') {
                            response.writeHead(404, { 'Content-Type': 'text/html' });
                            response.end('static 4ile n0t 4ound', 'utf-8');
                        }
                        else {
                            response.writeHead(500);
                            response.end('Sorry, the server broke: '+error.code+' ..\n');
                        }
                    }
                    else {
                        response.writeHead(200, { 'Content-Type': contentType });
                        response.end(content, 'utf-8');
                    }
                });
            break;

            default:
                response.writeHead(404, { 'Content-Type': 'text/html' });
                response.end('4ile n0t 4ound', 'utf-8');
            break;

        }
    }
    if (request.method == 'POST') {
        response.writeHead(404, { 'Content-Type': 'text/html' });
        response.end('4ile n0t 4ound', 'utf-8');
    }


}).listen(8125);
console.log('Server running at http://127.0.0.1:8125/');
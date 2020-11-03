const fs = require('fs')
const path = require('path')
const http = require('http')
const URL = require('url')

function uploadSourcemaps(url, context, dir) {
    // 拼装出调用插件的项目的绝对路径
    let outputPath = path.resolve(context, dir)
    const sourcemaps = findSourcemaps(outputPath)
    console.log("sourcemaps:", sourcemaps)
    sourcemaps.forEach(path => {
        upload(url, context, path)
    })
}

// 只上传sourcemaps
function findSourcemaps(outputPath) {
    let sourcemaps = []

    function read(outputPath) {
        const files = fs.readdirSync(outputPath)
        files.forEach(filePath => {
            const wholePath = path.resolve(outputPath, filePath)
            
            const fileStat = fs.statSync(wholePath)
            if (fileStat.isDirectory()) {
                read(wholePath)
            }

            if (fileStat.isFile() && /\.map$/.test(wholePath)) {
                sourcemaps.push(wholePath)
            }
        })
    }

    read(outputPath)

    return sourcemaps
}

/**
 * 具体的上传动作
 * 1. 使用node的http作为客户端上传工具
 * 2. 以content-type: multipart/form-data;形式上传
 * @param {*} url 
 * @param {*} file 
 */
function upload(url, context, file) {
    if (!url || !file) {
        throw new Error('must have a url and file')
    }
    const p = URL.parse(url, true)
    var options = {  
        hostname: p.hostname,  
        port: p.port,  
        path: p.path,  
        method: 'POST',
        headers: {
            "Content-Type": "multipart/form-data; boundary=---------------------------paZqsnEHRufoShdX6fh0lUhXBP4k",
            "Connection": "keep-alive"
        }
    };  
  
    var req = http.request(options, function (res) {  
        res.setEncoding('utf8');  
        res.on('data', function (chunk) {  
            console.log('BODY: ' + chunk);
        });
        res.on('end', function() {
            console.log('res end.')
        })
    });  
  
    req.on('data', data => {
        console.log(data.length)
    })
    req.on('error', function (e) {  
        console.log('problem with request: ' + e.message);  
    });  

    let content = ""
    let rStream = fs.createReadStream(file)
    // rStream.pipe(req)
    rStream.on('data', data => {
        content += data
    })
    let fileName = file.replace(context, "")
    rStream.on('end',function() {
        const body = [
            '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
            'Content-Disposition: form-data; name="content"',
            '',
            content,
            '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k',
            'Content-Disposition: form-data; name="fileName"',
            '',
            fileName,
            '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k--'
        ].join('\r\n');
        req.end(body);
    });
}

module.exports = uploadSourcemaps
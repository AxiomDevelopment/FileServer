const http = require('http');
const fs = require('fs');
const path = require('path');
const multiparty = require('multiparty');

let port = 8064;
const httpServer = http.createServer(requestHandler);
httpServer.listen(port, () => {
    console.log('server is listening on port ' + port)
});

function requestHandler(req, res) {
    if (req.url === '/fileserver') {
        sendIndexHtml(res);
    } else if (req.url === '/fileserver/images/trash.png') {
        fs.readFile(path.join(__dirname, '/images/trash.png'), (err, content) => {
            res.write(content);
        });
    } else if (req.url === '/fileserver/list') {
        sendListOfUploadedFiles(res);
    } else if (/\/fileserver\/download\/[^\/]+$/.test(req.url)) {
        sendUploadedFile(req.url, res);
    } else if (/\/fileserver\/upload\/[^\/]+$/.test(req.url)) {
        saveUploadedFile(req, res);
    } else if (/\/fileserver\/delete\/[^\/]+$/.test(req.url)) {
        deleteUploadedFile(req, res);
        console.log("delete request");
    } else if (/\/fileserver\/rename\/[^\/]+$/.test(req.url)) {
        renameUploadedFile(req, res);
        console.log("rename request");
    } else {
        sendInvalidRequest(res); //WHAT. HOW.
    }
}

function sendIndexHtml(res) {
    let indexFile = path.join(__dirname, 'index.html');
    fs.readFile(indexFile, (err, content) => {
        if (err) {
            res.writeHead(404, {
                'Content-Type': 'text'
            });
            res.write('File Not Found!');
            res.end();
        } else {
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            res.write(content);
            res.end();
        }
    })
}

function sendListOfUploadedFiles(res) {
    let uploadDir = path.join(__dirname, 'download');
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            console.log(err);
            res.writeHead(400, {
                'Content-Type': 'application/json'
            });
            res.write(JSON.stringify(err.message));
            res.end();
        } else {
            res.writeHead(200, {
                'Content-Type': 'application/json'
            });
            res.write(JSON.stringify(files));
            res.end();
        }
    })
}


function sendUploadedFile(url, res) {
    url = url.replace("\/fileserver", "");
    let file = path.join(__dirname, url);
    fs.readFile(file, (err, content) => {
        if (err) {
            res.writeHead(404, {
                'Content-Type': 'text'
            });
            res.write('File Not Found!');
            res.end();
        } else {
            res.writeHead(200, {
                'Content-Type': 'application/octet-stream'
            });
            res.write(content);
            res.end();
        }
    })
}


function saveUploadedFile(req, res) {
    console.log('saving uploaded file');
    let fileName = path.basename(req.url);
    let file = path.join(__dirname, 'download', fileName)
    req.pipe(fs.createWriteStream(file));

    //let data = ''; //
    //req.on('data', chunk => { //
    //  data += chunk; //
    //}); //

    var form = new multiparty.Form();
    let clientReportedSize;
    form.parse(req, function (err, fields, files) {
        /* res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.write('uploaded succesfully');
        res.end(); */
        Object.keys(fields).forEach(function (name) {
            /* console.log(name);
            console.log(parseInt(fields[name][0])); */
            clientReportedSize = parseInt(fields[name][0]);
        });
    });

    req.on('end', () => {
        // var stats = fs.statSync(file);
        // var fileSizeInBytes = stats.size;
        // if (fileSizeInBytes == clientReportedSize) {
        res.writeHead(200, {
            'Content-Type': 'text'
        });
        res.write('uploaded succesfully');
        res.end();
        // } else {
        //   sendInvalidRequest(res);
        //   // fs.unlink(file, (err) => { if (err) throw err; });
        //   console.log("File size mismatch.\nClient reported:" + clientReportedSize + "\nServer got:" + fileSizeInBytes);
        // }
    });
    req.on('error', (err) => {
        console.log(err);
        fs.unlink(file, (err) => {
            if (err) throw err;
        });
    });
}

function deleteUploadedFile(req, res) {
    console.log('deleting uploaded file');
    let fileName = path.basename(req.url);
    let file = path.join(__dirname, 'download', fileName);
    fs.unlink(file, (err) => {
        if (err) throw err;
    });
    res.writeHead(200, {
        'Content-Type': 'text'
    });
    res.write('deleted succesfully');
    res.end();
}

function renameUploadedFile(req, res) {
    console.log('renaming uploaded file');
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    });
    req.on('end', () => {
        console.log(data);
        let fileName = path.basename(req.url);
        let oldFile = path.join(__dirname, 'download', fileName);
        let newfileName = path.basename(data);
        let newFile = path.join(__dirname, 'download', newfileName);
        fs.renameSync(oldFile, newFile);
        res.writeHead(200, {
            'Content-Type': 'text'
        });
        res.write('renamed succesfully');
        res.end();
    });
}

function sendInvalidRequest(res) {
    res.writeHead(400, {
        'Content-Type': 'application/json'
    });
    res.write('Invalid Request');
    res.end();
}
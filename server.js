const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const server = require('http').createServer(app);
const { writeFileSync, readdirSync, statSync } = require("fs");
const port = 8064;

app.use('/fileserver', express.static('public'));
app.use(fileUpload());

app.post('/fileserver', function (req, res) {
    if (!req.files || Object.keys(req.files).length == 0) {
        return res.status(400).send('No files were uploaded.');
    }
    let file = req.files.file;
    if (file.size != file.data.length) return res.status(400).send('File impartially uploaded.');
    writeFileSync(`./public/upload/${file.name}`, file.data);
    res.status(200).send([file.name, file.size]);
});

app.get('/fileserver/init', function (req, res) {
    let files = readdirSync('./public/upload');
    var returnArray = [];
    for (let file of files) {
        let data = statSync(`./public/upload/${file}`);
        returnArray.push([file, data.size]);
    }
    res.status(200).send(returnArray);
});

server.listen(port, () => console.log(`listening on port ${port}`));
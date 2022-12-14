const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
app.use(fileUpload());
const compression = require('compression');
app.use(compression());
const { writeFileSync, readdirSync, statSync, unlinkSync } = require("fs");
const port = 8064;
app.listen(port, () => console.log('Server is running on port', port));

app.get('/fileserver/', (_req, res) => res.sendFile(__dirname + '/resources/index.html'));
app.use('/fileserver/resources', express.static('resources'));
app.use('/fileserver/', express.static('upload'));

app.put('/fileserver/file', (req, res) => {
    try {
        let file = req.files.file;
        writeFileSync(`./upload/${file.name}`, file.data);
        res.status(200).send();
    } catch (e) { console.error(e); res.status(e).send() };
});

app.get('/fileserver/file', (req, res) => {
    try {
        let fileName = req.get('File-Name');
        res.sendFile(__dirname + `/upload/${fileName}`);
    } catch (e) { console.error(e); res.status(e).send() };
});

app.get('/fileserver/files', (req, res) => {
    try {
        let files = readdirSync('./upload');
        let returnArray = [];
        for (let file of files) {
            let data = statSync(`./upload/${file}`);
            returnArray.push({ name: file, size: data.size });
        }
        res.status(200).send(returnArray);
    } catch (e) { console.error(e); res.status(e).send() };
});

app.delete('/fileserver/file', (req, res) => {
    try {
        let fileName = req.get('File-Name');
        unlinkSync(`./upload/${fileName}`);
        res.status(200).send();
    } catch (e) { console.error(e); res.status(e).send() };
});
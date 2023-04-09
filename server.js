const express = require('express');
const compress = require('compression-next');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const app = express();

const port = 8001;
const path = '/fileserver';

app.use(compress({ threshold: 500 }));
app.use(path, express.static('public'));
app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }));

app.listen(port, () => console.log(`listening on port ${port}`));

app.get(path, (_, res) => res.sendFile(__dirname + '/index.html'));
app.get(path + '/client.js', (_, res) => res.sendFile(__dirname + '/client.js'));
app.get(path + '/favicon.ico', (_, res) => res.sendFile(__dirname + '/favicon.ico'));

app.post(path, (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    let file = req.files.file;
    // if file name contains a slash return an error
    if (file.name.includes('/')) return res.status(400).send('Invalid file name');
    let uploadPath = __dirname + '/public/' + file.name;

    file.mv(uploadPath, (err) => {
        if (err) return res.status(500).send(err);
        res.send('success');
    });
});

// respond to get request for public files by returning the filename
app.get(path + '/get', (_, res) => {
    // get all file names from the public folder and return them
    const files = fs.readdirSync(__dirname + '/public');
    res.send(files);
});

// respond to delete request for public files by deleting the file
app.delete(path + '/:file', (req, res) => {
    // get the file name from the request
    let file = req.params.file;
    // if file name contains a slash return an error
    if (file.includes('/')) return res.status(400).send('Invalid file name');
    // delete the file
    fs.unlinkSync(__dirname + '/public/' + file);
    res.send('success');
});
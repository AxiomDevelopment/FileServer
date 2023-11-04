const express    = require('express');
const compress   = require('compression-next');
const fileUpload = require('express-fileupload');
const fs  = require('fs');
const app = express();

const port = 8064;
const path = '/fileserver';

app.use(compress({ threshold: 500 }));
app.use(path, express.static('files'));
app.use(fileUpload({ useTempFiles: true, tempFileDir: '/tmp/' }));

app.listen(port, () => console.log(`listening on port ${port}`));

app.get(path,                  (_, res) => res.sendFile(__dirname + '/index.html'));
app.get(path + '/client.js',   (_, res) => res.sendFile(__dirname + '/client.js'));
app.get(path + '/favicon.ico', (_, res) => res.sendFile(__dirname + '/favicon.ico'));

app.post(path, (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) throw 'nofile';

        const file = req.files.file;
        if (file.name.includes('/') || file.name.includes('\\')) throw 'invalidname';
        const uploadPath = __dirname + '/files/' + file.name;
    
        file.mv(uploadPath, (err) => {
            if (err) throw err;
            res.send('success');
        });
    } catch (error) {
        console.error(error);
        switch (error) {
            case 'nofile': res.status(400).send('No file uploaded'); break;
            case 'invalidname': res.status(400).send('Invalid file name'); break;
            default: res.status(500).send('Internal server error'); break;
        }
    }
});

app.get(path + '/get', (_, res) => {
    const files = fs.readdirSync(__dirname + '/files');
    res.send(files);
});

app.delete(path + '/:file', (req, res) => {
    const file = req.params.file;
    if (file.includes('/')) return res.status(400).send('Invalid file name');
    fs.unlinkSync(__dirname + '/files/' + file);
    res.send('success');
});
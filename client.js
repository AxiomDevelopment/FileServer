function requestFiles() {
    const request = new XMLHttpRequest();
    request.addEventListener('load', () => {
        document.getElementById('files').innerHTML = '';
        for (const file of JSON.parse(request.responseText)) {
            const link = document.createElement('a');
            link.href      = './' + file;
            link.innerText = file;
            const deleteButton     = document.createElement('button');
            deleteButton.innerText = 'Delete';
            deleteButton.addEventListener('click', () => deleteFile(file));
            document.getElementById('files').appendChild(link);
            document.getElementById('files').appendChild(document.createTextNode(' '));
            document.getElementById('files').appendChild(deleteButton);
            document.getElementById('files').appendChild(document.createElement('br'));
        }
    });
    request.open('GET', './get');
    request.send();
}

function deleteFile(file) {
    const deleteRequest = new XMLHttpRequest();
    deleteRequest.addEventListener('load', () => requestFiles());
    deleteRequest.open('DELETE', './' + file);
    deleteRequest.send();
}

window.addEventListener('load', () => {
    setInterval(() => requestFiles(), 3000);
    requestFiles();
    const form = document.getElementById('uploadForm');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const startTime = Date.now();
        const request = new XMLHttpRequest();
        request.upload.addEventListener('progress', (event) => {
            let percent = (event.loaded / event.total) * 100;
            percent = percent.toFixed(2);
            document.getElementById('progressNumber').innerText = percent + '%';

            let timeRemaining = (100 - percent) * ((Date.now() - startTime) / percent);
            timeRemaining = timeRemaining / 1000;
            timeRemaining = Math.round(timeRemaining);
            document.getElementById('timeRemaining').innerText = timeRemaining + 's';

            let uploadSpeed = (event.loaded / 1000) / ((Date.now() - startTime) / 1000);
            uploadSpeed = Math.round(uploadSpeed / 1000);
            document.getElementById('uploadSpeed').innerText = uploadSpeed * 8 + ' mb/s';

            if (percent == 100) document.getElementById('progressNumber').innerText = 'Processing...';
        });
        request.addEventListener('load', () => {
            document.getElementById('progressNumber').innerText = 'Done!';
            requestFiles();
        });
        request.open('POST', './');
        request.send(new FormData(form));
    });
});
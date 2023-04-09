function requestFiles() {
    let request = new XMLHttpRequest();
    document.getElementById('files').innerHTML = '';
    request.addEventListener('load', () => {
        for (let file of JSON.parse(request.responseText)) {
            let fileDiv = document.createElement('div');
            let link = document.createElement('a');
            link.href = './' + file;
            link.innerText = file + ' ';
            let deleteButton = document.createElement('button');
            deleteButton.innerHTML = 'Delete';
            deleteButton.addEventListener('click', () => deleteFile(file));
            fileDiv.appendChild(link);
            fileDiv.appendChild(deleteButton);
            fileDiv.appendChild(document.createElement('br'));
            document.getElementById('files').appendChild(fileDiv);
        }
    });
    request.open('GET', './get');
    request.send();
}

function deleteFile(file) {
    let deleteRequest = new XMLHttpRequest();
    deleteRequest.addEventListener('load', () => requestFiles());
    deleteRequest.open('DELETE', './' + file);
    deleteRequest.send();
}

window.addEventListener('load', () => {
    // setInterval(() => requestFiles(), 3000);
    requestFiles();
    // when uploading a file
    let form = document.getElementById('uploadForm');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        let data = new FormData(form);
        let request = new XMLHttpRequest();
        // when the upload is in progress
        request.upload.addEventListener('progress', (event) => {
            //calculate the completion percentage
            let percent = (event.loaded / event.total) * 100;
            percent = percent.toFixed(2);
            document.getElementById('progressNumber').innerHTML = percent + '%';
            //calculate the time remaining in seconds with startTime
            let timeRemaining = (100 - percent) * ((new Date().getTime() - startTime) / percent);
            timeRemaining = timeRemaining / 1000;
            timeRemaining = Math.round(timeRemaining);
            document.getElementById('timeRemaining').innerHTML = timeRemaining + 's';
            //calculate the upload speed in mb/s
            let uploadSpeed = (event.loaded / 1000) / ((new Date().getTime() - startTime) / 1000);
            uploadSpeed = Math.round(uploadSpeed / 1000);
            document.getElementById('uploadSpeed').innerHTML = uploadSpeed * 8 + ' mb/s';
        });
        // when the upload is done
        request.addEventListener('load', () => {
            document.getElementById('progressNumber').innerHTML = 'Done!';
            requestFiles();
        });
        let startTime = new Date().getTime();
        request.open('POST', './');
        request.send(data);
    });
});
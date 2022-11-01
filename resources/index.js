getAllFiles();

function createFilebox(name, size) {
    let div = document.createElement('div');
    div.setAttribute("name", name);
    div.setAttribute("class", "filebox");
    div.innerText = `${name} \n\n ${Math.round((size / 1000000) * 100) / 100}MB`;
    div.href = `./upload/${name}`;
    div.download = name;
    // add download button
    let download = document.createElement('button');
    download.setAttribute("class", "download");
    download.innerText = "Download";
    download.setAttribute("onclick", 'getFile(this.parentNode.getAttribute("name"))');
    div.appendChild(download);
    // add delete button
    let delbutton = document.createElement('button');
    delbutton.setAttribute("class", "deletebutton");
    delbutton.innerText = "Delete";
    delbutton.setAttribute("onclick", 'deleteFile(this.parentNode.getAttribute("name"))');
    div.appendChild(delbutton);
    // add to document
    document.getElementById("downloadables").appendChild(div);
}

function putFile() {
    let formdata = new FormData();
    formdata.append('file', document.getElementById('putfile').files[0]);
    let xhr = new XMLHttpRequest();
    xhr.timeout = 0;
    let timeStarted = Date.now();
    // progress and time left
    xhr.upload.addEventListener('progress', function (e) {
        let file1Size = document.getElementById('putfile').files[0].size;
        if (e.loaded <= file1Size) {
            let percent = Math.round(e.loaded / file1Size * 100);
            document.getElementById('percentage').innerHTML = percent + '%';
            let timeElapsed = Date.now() - timeStarted;
            //display size of file in megabytes using file1Size variable with 1 decimal place
            document.getElementById('size').innerHTML = `${Math.round((file1Size / 1000000) * 100) / 100}MB`;
            let uploadSpeed = e.loaded / (timeElapsed / 1000);
            document.getElementById('speed').innerHTML = Math.round(uploadSpeed / 1000 / 1000 / 8) + ' Megabit/s';
            document.getElementById('timeleft').innerHTML = Math.round((file1Size - e.loaded) / uploadSpeed) + 's';
        }
    });
    xhr.onload = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            document.getElementById('timeleft').innerHTML = 'Done!';
            document.getElementById('percentage').innerHTML = '100%';
            getAllFiles();
        } else {
            alert("File upload failed");
        }
    }
    xhr.open("PUT", '/fileserver/file');
    xhr.send(formdata);
}

//get request for single file
function getFile(filename) {
    let xhr = new XMLHttpRequest();
    xhr.timeout = 0;
    xhr.responseType = 'blob';
    xhr.onload = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            let element = document.createElement('a');
            element.setAttribute('href', URL.createObjectURL(xhr.response));
            element.setAttribute('download', filename);
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        } else {
            alert("File not found");
        }
    }
    xhr.open("GET", '/fileserver/file');
    xhr.setRequestHeader('File-Name', filename);
    xhr.send();
}

//get request for all files
function getAllFiles() {
    let xhr = new XMLHttpRequest();
    xhr.timeout = 0;
    xhr.onload = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
            let files = JSON.parse(xhr.response);
            document.getElementById("downloadables").innerHTML = "";
            for (let file of files) {
                createFilebox(file.name, file.size);
            }
        } else {
            alert("Something went wrong");
        }
    }
    xhr.open("GET", '/fileserver/files');
    xhr.send();
}

//delete file with xml request
function deleteFile(filename) {
    let xhr = new XMLHttpRequest();
    xhr.timeout = 0;
    xhr.onload = function () {
        if (xhr.readyState == 4 && xhr.status == "200") {
            getAllFiles();
        } else {
            alert("File not found");
        }
    }
    xhr.open("DELETE", '/fileserver/file');
    xhr.setRequestHeader('File-Name', filename);
    xhr.send();
}
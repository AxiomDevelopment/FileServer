var downloadDOM = document.getElementById('download');
var toastDOM = document.getElementById('toast');
showUploadedFiles();
//setInterval(showUploadedFiles, 1000);

function deleteFile(fileName) {
    console.log('inside deleteFile');
    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/fileserver/delete/' + fileName, true);
    xhr.onreadystatechange = function () {
        event = null;
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                showToastMessage(xhr.responseText, 'success');
                showUploadedFiles();
            } else {
                showToastMessage(xhr.responseText, 'error');
            }
        }
    }
    xhr.send();
}

function renameFile(fileName) {
    console.log('inside renameFile');
    let newName = prompt("Enter a name to rename file (WARNING: INCLUDE FILE EXTENSION)");
    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/fileserver/rename/' + fileName, true);
    xhr.onreadystatechange = function () {
        event = null;
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                showToastMessage(xhr.responseText, 'success');
                showUploadedFiles();
            } else {
                showToastMessage(xhr.responseText, 'error');
            }
        }
    }
    xhr.send(newName);
}

function uploadFile(event) {
    console.log('inside uploadFile')
    let target = event.target || event.srcElement || event.currentTarget;
    let file = target.files[0];
    let xhr = new XMLHttpRequest();
    var d = new Date();
    var beginTime = d.getTime();
    var fileSize = file.size;
    xhr.upload.addEventListener("progress", function (e) {
        var percentComplete = e.loaded / e.total * 100;
        document.getElementById("uploadProgress").innerText = percentComplete.toFixed(2) + "%";

        var d = new Date();
        var currentTime = d.getTime();

        var totalTime = currentTime - beginTime;

        var ETA = (totalTime / percentComplete) * (100 - percentComplete) / 1000;
        // console.log(ETA);

        document.getElementById("eta").innerText = ETA.toFixed(2) + " seconds remaining :)";

    }, false);
    let uploadButton = document.getElementById("uploadButton");
    uploadButton.style.display = "none";
    xhr.open('POST', '/fileserver/upload/' + file.name.replace(/ /g, ""), true);
    //xhr.setRequestHeader('Content-Type', 'multipart/form-data');
    xhr.onreadystatechange = function () {
        event = null;
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                showToastMessage(xhr.responseText, 'success');
                document.getElementById("uploadProgress").innerText = "Finished!";
                uploadButton.style.display = "block";
                showUploadedFiles();
            } else {
                showToastMessage(xhr.responseText, 'error');
                document.getElementById("uploadProgress").innerText = "Failed!";
                // deleteFile(file.name.replace(/ /g, ""));
                uploadButton.style.display = "block";
            }
        }
    }

    var formData = new FormData();
    formData.append("file", file);
    formData.append("size", fileSize);
    console.log(fileSize);
    xhr.send(formData);
    event.target.value = "";

}

function showUploadedFiles() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', '/fileserver/list', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                let listOfFile = JSON.parse(xhr.responseText);
                let listOfFileHTML = ""
                for (var i = 0; i < listOfFile.length; i++) {
                    listOfFileHTML = listOfFileHTML + "<li> <a href='/fileserver/download/" + listOfFile[i] + "'>" + listOfFile[i] +
                        "</a></li>";
                    listOfFileHTML +=
                        `<a href='javascript:void(0)' onclick='deleteFile("${listOfFile[i]}")'><img src="/fileserver/images/trash.png"/></a>`;
                    listOfFileHTML +=
                        `<a href='javascript:void(0)' onclick='renameFile("${listOfFile[i]}")'><img src="https://image.flaticon.com/icons/png/24/3094/3094216.png"/></a>`;
                }
                downloadDOM.innerHTML = listOfFileHTML;
            } else {

            }
        }
    }
    xhr.send();
}

function showToastMessage(msg, type) {
    console.log('inside showtoast mesage', msg, type)
    toastDOM.innerText = msg;
    if (type === 'error') {
        toastDOM.classList.add('toast-visible-error');
        setTimeout(function () {
            toastDOM.classList.remove('toast-visible-error')
        }, 3000);
    } else {
        console.log('toastdom', toastDOM)
        toastDOM.classList.add('toast-visible-success');
        setTimeout(function () {
            toastDOM.classList.remove('toast-visible-success')
        }, 3000);
    }
}
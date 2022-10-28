var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function () {
    if (this.readyState != 4) return;

    if (this.status == 200) {
        var files = JSON.parse(this.responseText);
        for (let file of files) {
            createFilebox(file[0], file[1]);
        }
    }
};

xhr.open('get', "./init");
xhr.send();

function postFile() {
    var formdata = new FormData();
    formdata.append('file', document.getElementById('file1').files[0]);
    var request = new XMLHttpRequest();
    request.upload.addEventListener('progress', function (e) {
        var file1Size = document.getElementById('file1').files[0].size;
        if (e.loaded <= file1Size) {
            var percent = Math.round(e.loaded / file1Size * 100);
            document.getElementById('progress-bar-file1').style.width = percent + '%';
            document.getElementById('progress-bar-file1').innerHTML = percent + '%';
        }
        if (e.loaded == e.total) {
            document.getElementById('progress-bar-file1').style.width = '100%';
            document.getElementById('progress-bar-file1').innerHTML = '100%';
        }
    });
    request.onreadystatechange = () => {
        if (request.readyState == 4) {
            let res = JSON.parse(request.response)
            if (document.getElementsByName(res[0]).length != 0) return;
            createFilebox(res[0], res[1]);
        }
    }
    request.open('post', './');
    request.timeout = 0;
    request.send(formdata);
}

function reqFile(name) {
    window.open(`./upload/${name}`);
}

function createFilebox(name, size) {
    let div = document.createElement('div');
    div.setAttribute("name", name);
    div.setAttribute("class", "filebox");
    div.innerText = `${name} \n\n ${Math.round((size / 1000000) * 100) / 100}MB`;
    div.setAttribute("onclick", 'reqFile(this.getAttribute("name"))');
    div.href = `./upload/${name}`;
    div.download = name;
    document.getElementById("downloadables").appendChild(div);
}
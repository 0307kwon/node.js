const http = require("http");
const fs = require("fs");
const url = require("url");
const { report } = require("process");


function getTemplete(id,list_templete,contents){
    return `
    <!doctype html>
    <html>
    <head>
    <title>WEB1 - ${id}</title>
    <meta charset="utf-8">
    </head>
    <body>
    <h1><a href="/">WEB</a></h1>
    <ol>
        ${list_templete}
    </ol>
    <h2>${id}</h2>
    ${contents}
    </body>
    </html>
    `;
}

function getListTemplete(folder_list){
    let list_templete = "";
    for(let i=0; i<folder_list.length; i++){
        const title = folder_list[i];
        list_templete +=`<li><a href="/?id=${title}">${title}</a></li>`
    }    
    return list_templete;
}

const app = http.createServer(function(request,response){
    let url_requested = request.url;
    const queryData = url.parse(url_requested,true).query;
    const pathname =url.parse(url_requested,true).pathname;
    const folder = "./nodejs/post";

    let id,contents,list;

    fs.readdir(folder,(err, folder_list) => {
        if(err) throw err;

        list = folder_list;
        if(url_requested == '/'){
            url_requested = "/index.html";
        }
        if(url_requested == "/favicon.ico"){
            response.writeHead(404);
            response.end();
            return;
        }
        response.writeHead(200);
        
        id = queryData.id;

        const list_templete = getListTemplete(folder_list);

        if(pathname == '/'){
            if(id == null){
                id = "welcome";
                contents = "hi friend";
                const templete = getTemplete(id,list_templete,contents);
                response.end(templete);
            }else{
                fs.readFile(`nodejs/post/${id}`,"utf8",(err, fileContents) => {
                    contents = fileContents;
                    const templete = getTemplete(id,list_templete,contents);
                    response.end(templete);
                });
            }
        }else{
            response.writeHead(404);
            response.end("Not Found");
        }    
    });
});
app.listen(3000);
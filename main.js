const http = require("http");
const fs = require("fs");
const url = require("url");
const querystring = require("querystring");
const { report } = require("process");


function getTemplete(title,list_templete,contents){
    return `
    <!doctype html>
    <html>
    <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8">
    </head>
    <body>
    <h1><a href="/">WEB</a></h1>
    <ol>
        ${list_templete}
    </ol>
    <h2><a href="/create">create</a><h2>
    <h2>${title}</h2>
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

function redirectPostQuery(request,response){
    let body = "";

    request.on('data', chunk => {
        body += chunk.toString();
    });

    request.on('end' , () => {   
        body = querystring.parse(body);
        fs.writeFile(`./nodejs/post/${body.title}`,`${body.contents}`,"utf8", (err) => {
            if(err) throw err;
            console.log(body.title);
            response.writeHead(302,{Location:`/?id=${encodeURIComponent(body.title)}`});
            response.end();

        });

    });
}

function getCreateTemplete(){
    return `
    <form action="http://localhost:3000/process_create" method="POST">
        <p><input type="text" name="title" placeholder="제목을 입력하세요"></p>
        <p>
            <textarea name=contents placeholder="내용을 입력하세요"></textarea>
        </p>
        <p>
            <input type="submit">
        </p>
    </form>
    `;
}

const app = http.createServer(function(request,response){
    let url_requested = request.url;
    const queryData = url.parse(url_requested,true).query;
    const pathname =url.parse(url_requested,true).pathname;
    const folder = "./nodejs/post";

    let title;
    fs.readdir(folder,(err, folder_list) => {
        if(err) throw err;

        response.writeHead(200);
        
        title = queryData.id;
        const list_templete = getListTemplete(folder_list);
        if(pathname === '/'){
            if(title === undefined){
                title = "welcome";
                const welcomeContents = "hi friend";
                const templete = getTemplete(title,list_templete,welcomeContents);
                response.end(templete);
            }else{
                fs.readFile(`nodejs/post/${title}`,"utf8",(err, fileContents) => {
                    const templete = getTemplete(title,list_templete,fileContents);
                    response.end(templete);
                });
            }
        }else if(pathname === "/create"){
            title = "Create Post";
            const Createcontents = getCreateTemplete();
            const templete = getTemplete(title,list_templete,Createcontents);
            response.end(templete);
        }else if(pathname === "/process_create"){
            if(request.method === "POST"){  
                redirectPostQuery(request,response);
            }
        }else{
            response.writeHead(404);
            response.end("Not Found");
        }    
    });
});
app.listen(3000);
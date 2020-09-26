const http = require("http");
const fs = require("fs");
const url = require("url");
const querystring = require("querystring");
const { report } = require("process");


function getTemplete(title,list_templete,contents,control){
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
    ${control}
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

function redirectCreatePostQuery(request,response){
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
    <form action="/process_create" method="POST">
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

function getUpdateTemplete(title_origin,contents_origin){
    return `
    <form action="/process_update" method="POST">
    <input type="hidden" name="title_origin" value="${title_origin}">
    <p><input type="text" name="title_revision" placeholder="수정할 제목을 입력하세요." value="${title_origin}"></p>
    <p><textarea name="contents" placeholder="수정할 내용을 입력하세요">${contents_origin}</textarea></p>    
    <p><input type="submit"></p>
    </form>
    `;
}

function redirectUpdatePostQuery(request,response){
    let body = "";

    request.on('data', chunk => {
        body += chunk.toString();
    });

    request.on('end' , () => {   
        body = querystring.parse(body);
        fs.rename(`./nodejs/post/${body.title_origin}`, `./nodejs/post/${body.title_revision}`, function (err) {
            if (err) throw err;
            
            fs.writeFile(`./nodejs/post/${body.title_revision}`, body.contents, function (err) {
                if (err) throw err;
                console.log('Replaced!');
                response.writeHead(302,{Location:`/?id=${encodeURIComponent(body.title_revision)}`});
                response.end();
              });
          });
          
    });
}

function getDeleteTemplete(){
    return `
    <p>게시글이 삭제되었습니다.</p>
    <form action="/">
    <input type="submit" value="확인">
    </form>
    `;
}

const app = http.createServer(function(request,response){
    let url_requested = request.url;
    const queryData = url.parse(url_requested,true).query;
    const pathname =url.parse(url_requested,true).pathname;
    const folder = "./nodejs/post";

    let title,control;
    fs.readdir(folder,(err, folder_list) => {
        if(err) throw err;

        response.writeHead(200);
        
        title = queryData.id;
        control = `<a href="/create">create</a>`;
        const list_templete = getListTemplete(folder_list);
        if(pathname === '/'){
            if(title === undefined){
                title = "welcome";
                const welcomeContents = "hi friend";
                const templete = getTemplete(title,list_templete,welcomeContents,control);
                response.end(templete);
            }else{
                fs.readFile(`nodejs/post/${title}`,"utf8",(err, fileContents) => {
                    control += ` <a href="/update?id=${title}">update</a>`;
                    control += ` <a href="/delete?id=${title}">delete</a>`;
                    const templete = getTemplete(title,list_templete,fileContents,control);
                    response.end(templete);
                });
            }
        }else if(pathname === "/create"){
            title = "Create Post";
            const Createcontents = getCreateTemplete();
            const templete = getTemplete(title,list_templete,Createcontents,``);
            response.end(templete);
        }else if(pathname === "/process_create"){
            if(request.method === "POST"){  
                redirectCreatePostQuery(request,response);
            }
        }else if(pathname === "/update"){
            title = "Update Post";
            title_origin = queryData.id;
            fs.readFile(`nodejs/post/${title_origin}`,"utf8",(err, fileContents) => {
            const createContents = getUpdateTemplete(title_origin,fileContents);
            const templete = getTemplete(title,list_templete,createContents,``);
            response.end(templete);
            });
        }else if(pathname === "/process_update"){
            if(request.method === "POST"){  
                redirectUpdatePostQuery(request,response);
            }
        }else if(pathname === "/delete"){
            title = queryData.id;
            fs.unlink(`nodejs/post/${title}`, function (err) {
                if (err) throw err;
                console.log('File deleted!');
                const deleteContents = getDeleteTemplete();
                const templete = getTemplete(``,list_templete,deleteContents,``);
                response.end(templete);
              });
        }else{
            response.writeHead(404);
            response.end("Not Found");
        }    
    });
});
app.listen(3000);
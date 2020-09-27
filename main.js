const http = require("http");
const fs = require("fs");
const url = require("url");
const querystring = require("querystring");
const templeteObj = require("./lib/templeteObj.js");
const redirectObj = require("./lib/redirectObj.js");
const path = require("path");
const preprocessObj = require("./lib/preprocessObj.js");


function secureQuery(data){
    return path.parse(data);
}

const app = http.createServer(function(request,response){
    let url_requested = request.url;
    const queryData = url.parse(url_requested,true).query;
    const pathname =url.parse(url_requested,true).pathname;
    const folder = "./nodejs/post";

    let control,titleInQueryData;
    fs.readdir(folder,(err, folder_list) => {
        if(err) throw err;

        response.writeHead(200);
        
        titleInQueryData = queryData.id;
        if(titleInQueryData !== undefined){
            titleInQueryData = secureQuery(queryData.id).base;
        }
        
        control = `<a href="/create">create</a>`;
        const list_templete = templeteObj.getList(folder_list);
        if(pathname === '/'){
            const sanitizedTitle = preprocessObj.cleanText(titleInQueryData);
            if(sanitizedTitle === "undefined"){
                const title = "welcome";
                const welcomeContents = "hi friend";
                const templete = templeteObj.getEntire(title,list_templete,welcomeContents,control);
                response.end(templete);
            }else{ // read
                fs.readFile(`nodejs/post/${sanitizedTitle}`,"utf8",(err, fileContents) => {
                    if(err) throw err;
                    
                    control += ` <a href="/update?id=${sanitizedTitle}">update</a>`;
                    control += ` <a href="/delete?id=${sanitizedTitle}">delete</a>`;
                    const templete = templeteObj.getEntire(sanitizedTitle,list_templete,fileContents,control);
                    response.end(templete);
                });
            }
        }else if(pathname === "/create"){
            const title = "Create Post";
            const Createcontents = templeteObj.getCreate();
            const templete = templeteObj.getEntire(title,list_templete,Createcontents,``);
            response.end(templete);
        }else if(pathname === "/process_create"){
            if(request.method === "POST"){  
                redirectObj.createPost(request,response);
            }
        }else if(pathname === "/update"){
            const title = "Update Post";
            const title_origin = titleInQueryData;
            fs.readFile(`nodejs/post/${title_origin}`,"utf8",(err, fileContents) => {
            const createContents = templeteObj.getUpdate(title_origin,fileContents);
            const templete = templeteObj.getEntire(title,list_templete,createContents,``);
            response.end(templete);
            });
        }else if(pathname === "/process_update"){
            if(request.method === "POST"){  
                redirectObj.updatePost(request,response);
            }
        }else if(pathname === "/delete"){
            const title = titleInQueryData;
            fs.unlink(`nodejs/post/${title}`, function (err) {
                if (err) throw err;
                console.log('File deleted!');
                const deleteContents = templeteObj.getDelete();
                const templete = templeteObj.getEntire(``,list_templete,deleteContents,``);
                response.end(templete);
              });
        }else{
            response.writeHead(404);
            response.end("Not Found");
        }    
    });
});
app.listen(3000);
const http = require("http");
const fs = require("fs");
const url = require("url");


const app = http.createServer(function(request,response){
    let url_requested = request.url;
    const queryData = url.parse(url_requested,true).query;

    console.log(queryData.id);
    if(url_requested == '/'){
        url_requested = "/index.html";
    }
    if(url_requested == "/favicon.ico"){
        response.writeHead(404);
        response.end();
        return;
    }
    response.writeHead(200);
    console.log(__dirname+url);
    response.end(fs.readFileSync(__dirname+url_requested));
});
app.listen(3000);
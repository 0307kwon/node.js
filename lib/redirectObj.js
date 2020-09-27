const querystring = require("querystring");
const fs = require("fs");
const preprocessObj = require("./preprocessObj.js");

module.exports = {
    createPost:function(request,response){
        let body = "";
    
        request.on('data', chunk => {
            body += chunk.toString();
        });
    
        request.on('end' , () => {   
            body = querystring.parse(body);
            const sanitizeTitle = preprocessObj.cleanText(body.title);
            const sanitizeContents = preprocessObj.cleanText(body.contents);
            fs.writeFile(`./nodejs/post/${sanitizeTitle}`,`${sanitizeContents}`,"utf8", (err) => {
                if(err) throw err;
                response.writeHead(302,{Location:`/?id=${encodeURIComponent(sanitizeTitle)}`});
                response.end();
    
            });
    
        });
    },
    updatePost:function(request,response){
        let body = "";
    
        request.on('data', chunk => {
            body += chunk.toString();
        });
    
        request.on('end' , () => {   
            body = querystring.parse(body);
            const sanitizeTitleOrigin = preprocessObj.cleanText(body.title_origin);
            const sanitizeTitleRevision = preprocessObj.cleanText(body.title_revision);
            const sanitizeContents = preprocessObj.cleanText(body.contents);
            fs.rename(`./nodejs/post/${sanitizeTitleOrigin}`, `./nodejs/post/${sanitizeTitleRevision}`, function (err) {
                if (err) throw err;
                
                fs.writeFile(`./nodejs/post/${sanitizeTitleRevision}`, sanitizeContents, function (err) {
                    if (err) throw err;
                    response.writeHead(302,{Location:`/?id=${encodeURIComponent(sanitizeTitleRevision)}`});
                    response.end();
                  });
              });
              
        });
    }
}
var sys = require('sys');
var base64_decode = require('base64').decode;
var base64_encode = require('base64').encode;
var Buffer = require('buffer').Buffer;
var extend = require('extend');

global.app.post('/post', function(req, res){
    var body = '';
    req.on('data', function (chunk) {
        body += chunk;
    });
    req.on('end', function ()
    {
        var json = JSON.parse(body);
//        console.log(json);
        margeArticles(json);
    });
});

function margeArticles(obj) {
    var fileContentInBase64 = obj['fileFromRepo']['content'],
        decodedContentObject = JSON.parse(base64_decode(fileContentInBase64));

    var curList = decodedContentObject['media rules'];
        curList.push(obj['testArticle']);

    decodedContentObject['media rules']=extend(curList);
//    console.log(JSON.stringify(decodedContentObject, false, 4));

    var buf = new Buffer(JSON.stringify(decodedContentObject, false, 4))
    console.log(base64_encode(buf));

    global.app.get("/get", function(req, res) {
        res.send(base64_encode(buf));
    });
}

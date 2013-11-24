var fs = require('fs')
    , colors = require('colors')
    , path = require('path')
    , md5 = require('MD5')
    , sh = require("shorthash")
    , extend = require('extend');

var dir = "article_data/";

var outputJson = {};
var i = 0;

fs.readdir(dir, function(err, files){
    var filesArr = [];

    files.map(function(file){
        var fileExtension = file.split('.');

        fileExtension = fileExtension[fileExtension.length -1];
        fileExtension.toLowerCase();

        if (fileExtension === 'json'){
            filesArr.push(file);
        }
    });

    var fileCount = filesArr.length;

    filesArr.map(function(file){
        var fileName = path.basename(file, ".json");
        var fileJson = JSON.parse(fs.readFileSync(dir+file, "utf8"));

        for (tag in fileJson) {
            var targetDataArr = fileJson[tag];

            var i2=0;
            while(i2<targetDataArr.length){
                var targetObj = targetDataArr[i2],
                    targetEmail = targetObj["author-mail"],
                    targetUrl = targetObj["url"];

                if(typeof targetEmail === 'string') {
                    var authorMailHash = md5(targetEmail);

                    targetObj["author-mail-hash"] = authorMailHash;
                }

                if(typeof targetUrl === 'string') {
                    var targetID = targetObj["id"];

                    if (typeof targetID !== 'string') {
                        var authorUrlHash = sh.unique(targetUrl);

                        targetObj["id"] = authorUrlHash;
                    }

                }

                i2++;
            }

        }

        outputJson[fileName] = extend(fileJson);
        i++;
        if (i === fileCount) {
            fs.readdir('public/output',function(e){
                if(!e || (e && e.code === 'EEXIST')){
                    generateJSON();
                } else if (e.code === 'ENOENT') {
                    fs.mkdir('public/output');
                    generateJSON();
                } else {
                    console.log(e);
                }
            });

            // function for write json file
            var generateJSON = function() {
                fs.writeFile("public/output/all-data.json", JSON.stringify(outputJson), function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Generatind articles data - DONE".green);
                    }
                });
            };
        }
    });
});
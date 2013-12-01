var fs = require('fs')
    , colors = require('colors')
    , path = require('path')
    , md5 = require('MD5')
    , sh = require("shorthash")
    , extend = require('extend');

var generateData = function() {
    //Generating output data with all articles info
    var outputJson = {},
        dir = appDir + "/article_data/";

    fs.readdir(dir, function(err, files){
        var jsonFilesArr = [];

        //Take only json files
        files.map(function(file){
            var fileExtension = file.split('.');

            fileExtension = fileExtension[fileExtension.length -1];
            fileExtension.toLowerCase();

            if (fileExtension === 'json'){
                jsonFilesArr.push(file);
            }
        });

        var jsonFileCount = jsonFilesArr.length;

        var jsonFileQueue = 0;
        jsonFilesArr.map(function(file){
            var fileName = path.basename(file, ".json");
            var currentFile = JSON.parse(fs.readFileSync(dir+file, "utf8"));

            //Processing json data to add custom objects to it
            for (tag in currentFile) {
                var targetDataArr = currentFile[tag];

                var i=0;
                while(i<targetDataArr.length){
                    var targetObj = targetDataArr[i],
                        targetEmail = targetObj["author-mail"],
                        targetUrl = targetObj["url"];

                    //Generating email md5 hash
                    if(typeof targetEmail === 'string') {
                        var authorMailHash = md5(targetEmail);

                        targetObj["author-mail-hash"] = authorMailHash;
                    }

                    //Generating unique ID by hash
                    if(typeof targetUrl === 'string') {
                        var targetID = targetObj["id"];

                        if (typeof targetID !== 'string') {
                            var authorUrlHash = sh.unique(targetUrl);

                            targetObj["id"] = authorUrlHash;
                        }
                    }

                    i++;
                }
            }

            outputJson[fileName] = extend(currentFile);
            jsonFileQueue++;
            if (jsonFileQueue === jsonFileCount) {
                fs.readdir(appDir+'/public/output/',function(e){
                    if(!e || (e && e.code === 'EEXIST')){
                        generateJSON();
                    } else if (e.code === 'ENOENT') {
                        fs.mkdir(appDir+'/public/output/');
                        generateJSON();
                    } else {
                        console.log(e);
                    }
                });

                // function for write json file
                var generateJSON = function() {
                    articlesJson = JSON.stringify(outputJson) || {}; // Updating global object

                    fs.writeFile(appDir+"/public/output/all-data.json", JSON.stringify(outputJson), function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("Generating Articles data - DONE".green);
                        }
                    });
                };
            }
        });
    });
};

/* Export */
module.exports = {
    generateData: function(){
        generateData();
    }
};

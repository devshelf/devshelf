var fs = require('fs')
    , colors = require('colors')
    , path = require('path')
    , md5 = require('MD5')
    , sh = require('shorthash')
    , generateIDs = require('./aticles-ids')
    , extend = require('extend');


/**
 * Extend srcInput arcicles data with extendedInput data (for localization data merge)
 * @param {Object} srcInput
 * @param {Object} extenderInput
 */
var extendArticlesData = function(srcInput, extenderInput){
    var src = JSON.parse(JSON.stringify(srcInput)), //Cloning objects to isolate from main
        extender = JSON.parse(JSON.stringify(extenderInput));

    for (var cat in extender) {
        var catArr = extender[cat],
            srcTagArr = src[cat] || [];

        if (srcTagArr.length === 0) {
            src[cat] = [];
        }

        src[cat] = srcTagArr.concat(catArr);
    }

    return src;
};

/**
 * Generate JSON file with all articles data
 * @param {String} targetDir
 * @param {String} lang
 */
var prepareJSON = function(targetDir, lang) {
    //Generating output data with all articles info
    var langDefault = global.opts.l18n.defaultLang,
        language = lang || langDefault,
        localizationEnabled = language !== langDefault,

        dir = localizationEnabled ? targetDir + language + '/' : targetDir,

        outputJSON = {},

        dataOutputDir = global.opts.dataOutputDir,

        articlesDataFile = global.opts.articlesDataFile,
        articlesDataLangFile = global.opts.articlesDataLangFile;

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

            //updating currentFile properties
            var targetDataArr = currentFile[fileName] || [];

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

            outputJSON = extend(outputJSON, currentFile);
            jsonFileQueue++;

            //When all files scanned, now heading to writing
            if (jsonFileQueue === jsonFileCount) {
                var finalJSON = outputJSON;

                //If localized, merge with main JSON
                if (localizationEnabled) {

                    var defaultLangJSON = global.articlesData[langDefault];

                    //pure data selection, only lang
                    global.articlesData[global.opts.articlesCleanLangObjPrefix+language] = finalJSON

                    finalJSON = extendArticlesData(defaultLangJSON, outputJSON);
                }

                //Updating global objects
                global.articlesData[language] = finalJSON || {};
                generateIDs.updateIDs(language);
                generateTagLinks(language);

                // function for write json file
                var writeToFile = function(data, dir, fileName) {
                    var JSONformat = null;

                    if (global.MODE === 'development') {
                        JSONformat = 4;
                    }

                    fs.writeFile(dir + fileName, JSON.stringify(data, null, JSONformat), function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("Generating Articles data in ".green + dir.green + fileName.green + ": DONE".green);

                        }
                    });
                };

                (function(fullJSON, onlyLang) {
                    var outputDir = global.appDir+dataOutputDir;

                    if (localizationEnabled) {
                        outputDir = global.appDir+dataOutputDir+language+'/';
                    }

                    var processJSON = function(){
                        writeToFile(fullJSON, outputDir, articlesDataFile);

                        if (localizationEnabled) {
                            writeToFile(onlyLang, outputDir, articlesDataLangFile);
                        }
                    };

                    //Prepare output folder and write file
                    fs.readdir(outputDir,function(e){
                        if(!e || (e && e.code === 'EEXIST')){
                            processJSON();
                        } else if (e.code === 'ENOENT') {
                            fs.mkdir(outputDir);
                            processJSON();
                        } else {
                            console.log(e);
                        }
                    });
                })(finalJSON, outputJSON);
            }
        });
    });
};

var generateTagLinks = function(lang) {
    //cleaning
    global.tagLinks[lang] = {};

    var getOnlyOne = [];

    for (var section in global.articlesData[lang]) {
        var targetArr = global.articlesData[lang][section] || [];

        if (typeof global.tagLinks[lang][section] !== 'object') {
            global.tagLinks[lang][section] = []
        }

        targetArr.map(function(article){
            var mainTag = article.tags[0];

            //writing only one of a king
            if (getOnlyOne.indexOf(mainTag) < 0) {
                getOnlyOne.push(article.tags[0])

                global.tagLinks[lang][section].push({
                    linkTitle: article.tags[0],
                    linkHref: '/#!/search/' + article.tags[0].replace(/\s+/g, '_')
                });
            }

        });
    }

};

var generateData = function() {
    prepareJSON(global.appDir + '/articles-data/');

    global.opts.l18n.additionalLangs.map(function(item) {
        prepareJSON(global.appDir + '/articles-data/', item);
    });
};

/* Export */
module.exports = {
    generateData: function(){
        generateData();
    }
};
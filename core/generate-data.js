var fs = require('fs')
    , util = require('util')
    , colors = require('colors')
    , path = require('path')
    , md5 = require('MD5')
    , JSON5 = require('json5')
    , sh = require('shorthash')
    , generateIDs = require('./aticles-ids')
    , extend = require('extend');

/**
 * Extend srcInput articles data with extendedInput data (for localization data merge)
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
 * @param {Object} p
 * @param {String} p.targetDir
 * @param {String} [p.lang]
 * @param {Function} p.callback
 */
var prepareJSON = function(p) {
    //Generating output data with all articles info
    var langDefault = global.opts.l18n.defaultLang,
        language = p.lang || langDefault,
        localizationEnabled = language !== langDefault,

        dir = localizationEnabled ? p.targetDir + language + '/' : p.targetDir,

        callback = p.callback || function(){},

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
            var fileName = path.basename(file, ".json"),
				currentObj = JSON5.parse(fs.readFileSync(dir+file, "utf8"));

            //updating currentFile properties
            var targetDataArr = currentObj[fileName] || [];

            var i=0;
            while(i<targetDataArr.length){
                var targetObj = targetDataArr[i],
                    targetEmail = targetObj["author-mail"],
                    targetUrl = targetObj["url"],
                    targetTags = targetObj["tags"];

				//Adding parent cat to tags
				if (util.isArray(targetTags)) {
					targetTags.push(fileName);
				}

				//normalizing all tags
				if (util.isArray(targetTags)) {
					var normolizedTargetTags = [];

					targetTags.forEach(function(item){
						normolizedTargetTags.push(item.toLowerCase());
					});

					targetObj["tags"] = normolizedTargetTags;
				}

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

            outputJSON = extend(outputJSON, currentObj);
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

                // Job is done, next goes some callbacks and writing output to file
                global.articlesData[language] = finalJSON || {};
                generateIDs.updateIDs(language);
                generateTagLinks(language);
                callback();


                // function for write json file
                var writeToFile = function(data, dir, fileName) {
                    var JSONformat = null;

                    if (global.MODE === 'development') {
                        JSONformat = 4;
                    }

                    fs.writeFile(dir + fileName, JSON5.stringify(data, null, JSONformat), function (err) {
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

        if ( !util.isArray(global.tagLinks[lang][section]) ) {
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
    prepareJSON({
        targetDir: global.appDir + '/articles-data/',
        callback: function(){
            //it's important to process main language data first

            global.opts.l18n.additionalLangs.map(function(lang) {
                prepareJSON({
                    targetDir:global.appDir + '/articles-data/',
                    lang: lang
                });
            });
        }
    });
};

/* Export */
module.exports = {
    generateData: function(){
        generateData();
    }
};
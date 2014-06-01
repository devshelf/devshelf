var fs = require('fs')
    , util = require('util')
    , colors = require('colors')
    , path = require('path')
    , md5 = require('MD5')
    , sh = require('shorthash')
    , sm = require('sitemap')
    , generateIDs = require('./aticles-ids')
    ;

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

        dir = localizationEnabled ? p.targetDir+ '/' + language + '/' : p.targetDir + '/',

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
				currentObj = {};

            try {
                currentObj = JSON.parse(fs.readFileSync(dir+file, "utf8"));
            } catch (e) {
                var shortDir = dir.replace(global.appDir + '/','');

                console.error('Error parsing articles data at ' + shortDir + file + ':', e);

                // If something goes wrong, don't update article data at all
                return false;
            }

            if (Object.keys(currentObj).length > 0) {
                //updating currentFile properties
                var targetDataArr = currentObj[fileName] || [];

                var i=0;
                while(i<targetDataArr.length){
                    targetDataArr[i] = processArticle(targetDataArr[i], fileName);

                    i++;
                }
            }

            outputJSON = extendArticlesData(outputJSON, currentObj);
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
                processTags(language);
                callback();


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
                            if (global.MODE === 'development') {
                                var shortDir = dir.replace(global.appDir + '/','');

                                console.log("Generating Articles data in ".green + shortDir.green + fileName.green + ": DONE".green);
                            }
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

/**
 * Process article object for normalization, ID generation and etc
 * @param {Object} targetObj
 * @param {String} fileName
 */
var processArticle = function(targetObj, fileName) {
    var workingObj = targetObj,
        targetEmail = workingObj["author-mail"],
        targetUrl = workingObj["url"],
        targetTags = workingObj["tags"];

    if (!util.isArray(targetTags)) {
        targetTags = workingObj["tags"] = [];
    }

    //Adding parent cat to tags
    if (util.isArray(targetTags)) {
        targetTags.push(fileName);
    }

    //normalizing all tags
    if (util.isArray(targetTags)) {
        var normolizedTargetTags = [];

        targetTags.forEach(function (item) {
            normolizedTargetTags.push(item.toLowerCase().replace(/((\s*\S+)*)\s*/, "$1"));
        });

        workingObj["tags"] = normolizedTargetTags;
    }

    //Generating email md5 hash
    if (typeof targetEmail === 'string') {
        var authorMailHash = md5(targetEmail);

        workingObj["author-mail-hash"] = authorMailHash;
    }

    //Generating unique ID by hash
    if (typeof targetUrl === 'string') {
        var targetID = workingObj["id"];

        if (typeof targetID !== 'string') {
            var authorUrlHash = sh.unique(targetUrl);

            workingObj["id"] = authorUrlHash;
        }
    }

    return workingObj;
};

/**
 * Process tags for creating sitemap and catalogue link list
 * @param {String} lang
 */
var processTags = function(lang) {
    var getOnlyOneMain = [],
        getOnlyOne = [],
        tagUrls = [],
        articlesData = global.articlesData[lang];

    //cleaning
    global.tagLinks[lang] = {};
    global.sitemap[lang] = {};

    for (var section in articlesData) {
        var targetArr = articlesData[section] || [];

        if ( !util.isArray(global.tagLinks[lang][section]) ) {
            global.tagLinks[lang][section] = []
        }

        // serfing through articles
        targetArr.map(function(article){
            var tags = article.tags,
                mainTag = tags[0];

            //writing only one of a king
            if (getOnlyOneMain.indexOf(mainTag) < 0) {
                getOnlyOneMain.push(mainTag)

                global.tagLinks[lang][section].push({
                    linkTitle: mainTag,
                    linkHref: '/#!/search/' + mainTag.replace(/\s+/g, '_')
                });
            }

            // serfing through tags
            tags.map(function(tag){

                //writing only one of a king
                if (getOnlyOne.indexOf(tag) < 0) {
                    getOnlyOne.push(tag);

                    tagUrls.push({
                        url: global.opts.app.host + '/#!/search/' + tag.replace(/\s+/g, '_')
                    });
                }
            });

        });
    }

    global.sitemap[lang] = sm.createSitemap({
        hostname: global.opts.app.host,
        cacheTime: 600000,        // 600 sec - cache purge period
        urls: tagUrls
    });
};

// Init
var generateData = function() {
    prepareJSON({
        targetDir: global.appDir + global.opts.articles.path,
        callback: function(){
            //it's important to process main language data first, because all add. langs are merged with main

            global.opts.l18n.additionalLangs.map(function(lang) {
                prepareJSON({
                    targetDir:global.appDir + global.opts.articles.path,
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
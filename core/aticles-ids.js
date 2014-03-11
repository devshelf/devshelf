var updateIDs = function(lang, pure) {
    var currentLanguage = lang,
        gettingPureData = pure || false,
        langDefault = global.opts.l18n.defaultLang,

        globalData = global.articlesData[currentLanguage],

        targetGlobalIDsData = currentLanguage;

    if (gettingPureData) {
        globalData = global.articlesData[global.opts.articlesCleanLangObjPrefix+currentLanguage];
        targetGlobalIDsData = global.opts.articlesCleanLangObjPrefix+currentLanguage;
    }

    //prepare global object
    if(global.articlesIDs[targetGlobalIDsData] === undefined){
        global.articlesIDs[targetGlobalIDsData] = [];
    }

    // Preparing existing IDs list
    for(var cat in globalData) {
        var targetArr = globalData[cat];

        var i=0;
        while(i<targetArr.length){
            global.articlesIDs[targetGlobalIDsData].push(targetArr[i].id)

            i++;
        }
    }

    if (!gettingPureData && currentLanguage !== langDefault) {
        updateIDs(currentLanguage, true);
    }

};

module.exports = {
    updateIDs: function(lang, pure){
        updateIDs(lang, pure);
    }
};
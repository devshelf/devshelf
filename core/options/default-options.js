/*

Server options

All basic settings are stored in options.js.
You can store secure settings in special secure-options.json file that will extend basic settings.

 */

module.exports = {
    "app": {
        "host" : "https://devshelf.us",
        "port":8080,
        "devPort":8888
    },

    "voting" : {
        "updateInterval": "180000"
    },

    "form" : {
        "masterRepo": "devshelf/devshelf-articles",
        "PRdescription": "Automatic pull request from [DevShelf.us](http://devshelf.us)",
        "PRtitlePrefix": "Form submit: \"",
        "PRtitlePostfix": "\" to ",
        "commitMessage": "Auto-commit: ",
        "PRbranch": "master"
    },

    "remoteDBhost": "127.0.0.1",
    "remoteDBport": "27017",
    "remoteDBuser": null,
    "remoteDBpwd": null,

    "cookieSecret": "secret",

    "dataOutputDir":"/public/output/",

    "articles" : {
        "repoName": "devshelf-articles",
        "path": "articles-data",
        "tagDescriptionPath": "articles-data/tags-decription",
        "updateInterval": 180000
    },

    "articlesDataFile": "all-data.json",
    "articlesVoteFile": "all-votes.json",

    "articlesDataLangFile": "localized-articles.json",
    "articlesCleanLangObjPrefix": "pure-",

    "github": {
        "repoName": "devshelf",

        "devAppID": "github devAppID",
        "devAppSecret": "github devAppSecret",

        "appID": "github appID",
        "appSecret": "github appSecret"
    }
};
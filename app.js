/* Module dependencies */
var express = require('express')
	, gzippo = require('gzippo')
    , colors = require('colors')
    , fs = require('fs')
    , mustache = require('mustache')
    , everyauth = require('everyauth')
    , path = require('path')
    , MongoStore = require('connect-mongostore')(express)
    ;
/* /Module dependencies */


/* Global vars */
global.articlesData = {}; //all-data.json obj with articles by lang (articlesData.en/ru/etc)
global.articlesIDs = {}; //all-data.json ID lists by lang (articlesIDs.en/ru/etc)
global.tagLinks = {}; //global object with tag links

global.appDir = path.dirname(require.main.filename); //path to project dir

global.MODE = process.env.NODE_ENV || 'development';

global.app = express();
global.opts = require('./core/options/'); //Global options
global.commonOpts = require('./core/options/common-options.json'); //Common options with Front-end
/* /Global vars */


/*
* Data
* */

global.indexData = {};

global.indexData[global.opts.l18n.defaultLang] = JSON.parse(fs.readFileSync(__dirname + '/public/index.json', "utf8"));

//filling lang properties
global.opts.l18n.additionalLangs.map(function(item) {
    global.indexData[item] = JSON.parse(fs.readFileSync(__dirname + '/public/'+item+'/index.json', "utf8"));
});


/*
* Update local information from git hub and regenerate all-data.json
* */
var articlesJson = require('./core/generate-data');
require('./core/updateData');

//Preparing initial data on start
articlesJson.generateData();


/**
* Session
*/
app.use(express.bodyParser())
    .use(express.cookieParser(global.opts.cookieSecret));

app.use(express.session({
    secret: global.opts.cookieSecret,
    store: new MongoStore({
        'db': 'sessions',
        host: global.opts.remoteDBhost,
        port: global.opts.remoteDBport
    })
}));


/**
* Localization
*/
var langMiddleware = function(req, res, next) {
    // todo: dmitryl: geoapi predict part will be here

    if (!req.session.lang) {
       if (req.method === 'GET') {
            //setting language on first enter

            req.session.lang = global.opts.l18n.defaultLang;
        }
   }

   // keep executing the router middleware
   next()
};
app.use(langMiddleware);

app.post('/lang', function (req, res, next) {
    var currentLang = req.body.lang || 'en';
    res.cookie('lang', currentLang, {maxAge: 900000, httpOnly: false});
    req.session.lang = currentLang || 'en';

    res.send();
});


/*
* auth module
* */

require('./core/auth');
app.use(everyauth.middleware());

var authDoneTpl = fs.readFileSync(__dirname+'/views/auth-done.html', "utf8");
app.get('/auth/stub', function (req, res) {
    var lang = req.cookies.lang || global.opts.l18n.defaultLang;

    var indexJson = global.indexData[lang];

    indexJson.authDone = false;

    var htmlToSend = mustache.to_html(authDoneTpl, indexJson);

    res.send(htmlToSend);
});

app.get('/auth/done', function (req, res) {
    var lang = req.cookies.lang || global.opts.l18n.defaultLang;

    //Creating cachedAuth for keeping auth after app restart
    req.session.authCache = req.session.auth;

    var indexJson = global.indexData[lang];

    indexJson.user = JSON.stringify(req.session.authCache.github.user);
    indexJson.authDone = true;

    var htmlToSend = mustache.to_html(authDoneTpl, indexJson);
    res.send(htmlToSend);
});


/*
 * git api form
 * */
require('./core/commit');


/**
* Validation
*/
var validation = require('./core/article-validate');
app.get('/validate', validation.articleValidate);


/**
* URL checker
*/
var check = require('./core/check-url-status');
app.get('/check-url', check.checkURLStatus);


/*
* web routing
* */
// Route for static files
app.set('route', __dirname + '/public');
app
	.use(gzippo.staticGzip(app.get('route')))
	.use(gzippo.compress());

//main page
app.get('/', function(req, res) {
    var lang = req.session.lang || global.opts.l18n.defaultLang;

    //text data
    var indexJson = {records:global.indexData[lang]};

    //for dynamic options update
    indexJson.commonOpts = global.commonOpts;

    //link to tags catalogues for main page
    indexJson.catalogue = global.tagLinks[lang];

    //Auth data
    indexJson.auth = (req.session.authCache && typeof req.session.authCache.github.user === 'object') || typeof req.user === 'object' ? true : false;


    //Preparing for client
    var clientIndexJson = {},
        clientIndexJsonFields = ['commonOpts','auth','records'];

    clientIndexJsonFields.map(function(item){
       clientIndexJson[item] = indexJson[item];
    });

    indexJson.appData = JSON.stringify(clientIndexJson);


    var indexPage = fs.readFileSync(__dirname + '/public/build/index.html', "utf8");
    var htmlToSend = mustache.to_html(indexPage, indexJson);

    res.send(htmlToSend);
});


/*
* voting module (requiring place matters)
* */
var voting = require('./core/voting');

if (global.opts.voting.enabled) {
    app.get('/plusVotes', voting.plusVotes); // post arguments: id, user
    app.get('/minusVotes', voting.minusVotes); // post arguments: id, user
    app.get('/getVotes', voting.getVotes); // post arguments: id
    app.get('/getAllVotes', voting.getAllVotes);
}

// Preparing initial data on start
voting.generateVotingData();


/*
* error hadnling
* */

if (MODE === 'production') {
    app.use(function(err, req, res, next) {
        console.log(err);

        res.send(404, '404');
    });

    app.use(function(err, req, res, next) {
        console.log(err);

        res.send(500, '500');
    });
}

var appPort = MODE === 'development' ? global.opts.app.devPort : global.opts.app.port;

app.listen(appPort);
var appPortString = appPort.toString();
console.log('[DevShelf] is working on '.blue + appPortString.blue + ' port in '.blue + MODE.blue + ' mode...'.blue);

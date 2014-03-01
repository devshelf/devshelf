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

global.appDir = path.dirname(require.main.filename); //path to project dir

global.MODE = process.env.NODE_ENV || 'development';

global.app = express();
global.opts = require('./core/options/'); //Global options
global.commonOpts = require('./core/options/common-options.json'); //Common options with Front-end
/* /Global vars */


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

app.get('/check-url', function (req, res) {
    // todo: dmitryl: make languages switchable

    var currentLang = req.body.lang || 'en';
    res.cookie('lang', currentLang, {maxAge: 900000, httpOnly: false});
    req.session.lang = currentLang || 'en';
//    req.session.visits = req.session.visits + 1 || 0;

    console.log('--- SESSION:', currentLang);

//    console.log('--- REQ.METHOD:', req.method);
//    console.log('--- SESSION:', req);
//    console.log('--- --- TEST testUser:', req.session.testUser);
//    console.log('--- --- TEST userLang:', req.session.userLang);
//    console.log('--- COOKIES:', req.cookies);

    res.send();
});


/*
* auth module
* */
require('./core/auth');

app.use(everyauth.middleware());

app.get('/auth/done', function (req, res) {
    var userData = JSON.stringify(req.session.auth.github.user);

    var authData = {
        user: userData
    };

    var authPage = fs.readFileSync(__dirname+'/views/auth-done.html', "utf8");
    var htmlToSend = mustache.to_html(authPage, authData);

    res.send(htmlToSend);
});

app.get('/auth/check', function (req, res) {
    var response = false;

    if ( (req.session.auth && typeof req.session.auth.github.user === 'object') || typeof req.user === 'object') {
        response = true;
    }

    res.send(response);
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

    //TODO: cache this
    //mustache generate index page
    var indexData = (lang === 'en') ? JSON.parse(fs.readFileSync(__dirname + '/public/index.json', "utf8")) : JSON.parse(fs.readFileSync(__dirname + '/public/ru/index.json', "utf8"));

    var indexJson = {records:indexData};
    indexJson.commonOpts = global.commonOpts;

    //Generating links to all sections
    for (var section in global.articlesData[lang]) {
        if (indexJson[section] === undefined) {
            indexJson[section] = [];
        }

        for (var articles in global.articlesData[lang][section]) {
            indexJson[section].push({
                linkTitle: articles,
                linkHref: '/#!/search/' + articles.replace(/\s+/g, '_')
            })
        }
    }

    indexJson.indexJson = JSON.stringify(indexJson);
    var indexPage = fs.readFileSync(__dirname + '/public/build/index.html', "utf8");
    var htmlToSend = mustache.to_html(indexPage, indexJson);
    //TODO: /cache this

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

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
global.currentLang = 'en';
/* /Global vars */


/*
* Update local information from git hub and regenerate all-data.json
* */
var articlesJson = require('./core/generate-data');
require('./core/updateData');

//Preparing initial data on start
articlesJson.generateData();


/*
* auth module
* */
require('./core/auth');


/*
 * git api form
 * */
require('./core/commit');

app.use(express.bodyParser())
    .use(express.cookieParser(global.opts.cookieSecret));

app.use(express.session({
    secret: global.opts.cookieSecret,
    store: new MongoStore({
        'db': 'sessions',
        host: global.opts.remoteDBhost,
        port: global.opts.remoteDBport
    })
  })
);
app.use(everyauth.middleware());

app.get('/auth/done', function (req, res) {
//    console.log(req.user);

    var userData = JSON.stringify(req.user.github);

    var authData = {
        user: userData
    };

    var authPage = fs.readFileSync(__dirname+'/views/auth-done.html', "utf8");
    var htmlToSend = mustache.to_html(authPage, authData);

    res.send(htmlToSend);
});

app.get('/auth/check', function (req, res) {
    var user = typeof req.user === 'undefined' ?  undefined : req.user.github.login;

    if (user === undefined) {
        res.send(false);
    } else {
        res.send(true);
    }
});


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


/* Localization */
app.use(function (req, res, next) {
    global.currentLang = req.session.lang || 'en';
//console.log('--- currentLang', currentLang);
    next();
});

app.post('/lang', function (req, res, next) {
//    console.log('========== new ==========');

// todo: dmitryl: geoapi predict part will be here

    currentLang = req.body.lang || 'en';
    res.cookie('lang', currentLang, {maxAge: 900000, httpOnly: false});
    req.session.lang = currentLang || 'en';
//    req.session.visits = req.session.visits + 1 || 0;

//    console.log('--- SESSION:', currentLang);

//    console.log('--- REQ.METHOD:', req.method);
//    console.log('--- SESSION:', req);
//    console.log('--- --- TEST testUser:', req.session.testUser);
//    console.log('--- --- TEST userLang:', req.session.userLang);
//    console.log('--- COOKIES:', req.cookies);

    res.send();
//    next();
});


/* /Localization */


/*
* web routing
* */
// Route for static files
app.set('route', __dirname + '/public');
app
	.use(gzippo.staticGzip(app.get('route')))
	.use(gzippo.compress());

// for opening index page
var arr = ['/','/index','/index.html','/home'];

app.get('/', function (req, res, next) {
    //mustache generate index page
    var indexData = (currentLang === 'en') ?
                    JSON.parse(fs.readFileSync(__dirname + '/public/index.json', "utf8")) :
                    JSON.parse(fs.readFileSync(__dirname + '/public/'+ currentLang +'/index.json', "utf8"));

//console.log('=== INDEX DATA', indexData, global.currentLang);

    arr.map(function(item) {
//        app.get(item, function(req, res) {
            var indexJson = { records: indexData };

            indexJson.commonOpts = global.commonOpts;

//console.log('====== INDEX DATA inner', indexData, global.currentLang);

            //Generating links to all sections
            for (var section in global.articlesData[currentLang]) {
                if (indexJson[section] === undefined) {
                    indexJson[section] = [];
                }

                for (var articles in global.articlesData[currentLang][section]) {
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
//        });
    });

    next();
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
 app.use(function(err, req, res, next) {
    res.send(404, '404');
});

app.use(function(err, req, res, next) {
    res.send(500, '500');
});

var appPort = MODE === 'development' ? global.opts.app.devPort : global.opts.app.port;

app.listen(appPort);
var appPortString = appPort.toString();
console.log('[DevShelf] is working on '.blue + appPortString.blue + ' port in '.blue + MODE.blue + ' mode...'.blue);

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
        res.send('false');
    } else {
        res.send('true');
    }
});


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

//mustache generate index page
var indexData = (global.opts.tempCurrentLang === 'en') ? JSON.parse(fs.readFileSync(__dirname + '/public/index.json', "utf8")) : JSON.parse(fs.readFileSync(__dirname + '/public/ru/index.json', "utf8"));

arr.map(function(item) {
    app.get(item, function(req, res) {
        var indexJson = {records:indexData};

        //Generating links to all sections
        for (var section in global.articlesData[global.opts.tempCurrentLang]) {
        	if (indexJson[section] === undefined) {
        		indexJson[section] = [];
        	}

			for (var articles in global.articlesData[global.opts.tempCurrentLang][section]) {
				indexJson[section].push({
					linkTitle: articles,
					linkHref: '/#!/search/' + articles.replace(/\s+/g, '_')
				})
			}
        }

        indexJson.indexJson = JSON.stringify(indexJson);
        var indexPage = fs.readFileSync(__dirname + '/public/build/index.html', "utf8");
        var htmlToSend = mustache.to_html(indexPage, indexJson);
        res.send(htmlToSend);
    });
});


/*
* voting module (requiring place matters)
* */
var voting = require('./core/voting');
app.get('/plusVotes', voting.plusVotes); // post arguments: id, user
app.get('/minusVotes', voting.minusVotes); // post arguments: id, user
app.get('/getVotes', voting.getVotes); // post arguments: id
app.get('/getAllVotes', voting.getAllVotes);

// Preparing initial data on start
voting.generateVotingData();


/*
* error hadnling
* */
app.use(function(req, res, next) {
    res.send(404, '404');
});

app.use(function(err, req, res, next) {
    res.send(500, '500');
});

var appPort = MODE === 'development' ? global.opts.app.devPort : global.opts.app.port;

app.listen(appPort);
var appPortString = appPort.toString();
console.log('[DevShelf] is working on '.blue + appPortString.blue + ' port in '.blue + MODE.blue + ' mode...'.blue);

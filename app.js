/* Module dependencies */
var express = require('express')
	, gzippo = require('gzippo')
    , colors = require('colors')
    , fs = require('fs')
    , mustache = require('mustache')
    , everyauth = require('everyauth')
    , MongoStore = require('connect-mongostore')(express)
    ;

global.MODE = process.env.NODE_ENV || 'development';

global.app = express();
global.opts = require('./core/options/'); //Global options


/*
* Update local information from git hub and regenerate all-data.json
* */
var articlesJson = require('./core/articles-json');
require('./core/gitPull');

// Preparing initial data till cron
fs.readFile(__dirname + '/public/output/all-data.json', function(err, data) {
    if (err) {
        articlesJson.generateData();
    }
});

/*
* auth module
* */
require('./core/auth');

app.use(express.bodyParser())
    .use(express.cookieParser(opts.cookieSecret));

app.use(express.session({
    secret: opts.cookieSecret,
    store: new MongoStore({
        'db': 'sessions',
        host: opts.remoteDBhost,
        port: opts.remoteDBport
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

    var authPage = fs.readFileSync('views/auth-done.html', "utf8");
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
var indexData = JSON.parse(fs.readFileSync(__dirname + '/public/index.json', "utf8"));

//TODO: check and generate file on first start
var sectionData;

try {
    sectionData = JSON.parse(fs.readFileSync(__dirname + '/public/output/all-data.json', "utf8")) || {};
} catch (e) {
    if (e.code === 'ENOENT') {
        sectionData = {};
        console.log('All-data.json is not generated yet, please re-run application.'.red);
    }
}

arr.map(function(item) {
    app.get(item, function(req, res) {
        var indexJson = {records:indexData};

        for (section in sectionData) {
        	if (indexJson[section] === undefined) {
        		indexJson[section] = [];
        	}

			for (articles in sectionData[section]) {
				indexJson[section].push({
					linkTitle: articles,
					linkHref: '/#!/search/' + articles
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
app.get('/plusVotes', voting.plusVotes); // (id, user)
app.get('/minusVotes', voting.minusVotes); // (id, user)
app.get('/getVotes', voting.getVotes); // (id)
app.get('/getAllVotes', voting.getAllVotes);


// Preparing initial data till cron
fs.readFile(__dirname + '/public/output/all-votes.json', function(err, data) {
    if (err) {
        voting.generateVotingData();
    }
});

/*
* error hadnling
* */
app.use(function(req, res, next) {
    res.send(404, '404');
});

app.use(function(err, req, res, next) {
    res.send(500, '500');
});

var appPort = MODE === 'development' ? opts.app.devPort : opts.app.port;

app.listen(appPort);
console.log('It is alive! On port '.green + appPort );
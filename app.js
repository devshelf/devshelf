/* Module dependencies */
var express = require('express')
	, gzippo = require('gzippo')
    , colors = require('colors')
    , fs = require('fs')
    , mustache = require('mustache')
    , everyauth = require('everyauth')
    , path = require('path')
    , http = require('http')
    , parseurl = require('url')
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

/**
* Links validator
* @param {Object} req — http request data
* @param {String} req.query.url - url of new article
* @param {String} req.query.title — title of new article
*/
app.get('/validate', function (req, res) {

	var url = parseurl.parse( req.query.url ),
		title = req.query.title;

	/**
	* Check on availability
	* @param {Function} callback
	*/
	function checkURLStatus( callback ) {
		var optionsget = {
			hostname : url.host,
			port : 80,
			path : url.path,
			method : 'GET'
		};

		// Make http request and check for statusCode — 2xx and 3xx accepted, otherwise fails
		var getData = function getData() {
			var reqGet = http.request(optionsget, function(res) {

				var content = {
					length: 0,
					data: ''
				}

				res.on('data', function(data) {
					content.length += data.length;
					content.data += data;

					if (content.length == res.headers['content-length']) {

						if ( (res.statusCode.toString().charAt(0) !== '2') && (res.statusCode.toString().charAt(0) !== '3') ) {
							callback( false );
						} else {
							callback( true );
						}
					}
				});

			});

			reqGet.end();
			reqGet.on('error', function(e) {
				callback( false );
			});

		}();
	}

	/**
	* Check for already exists title
	* @param {Function} callback
	*/
	function checkArticleFound( callback ) {

		// If leet than value, article title already exists
		var LevenshteinThreshold = 5;

		//http://www.merriampark.com/ld.htm, http://www.mgilleland.com/ld/ldjavascript.htm, Damerau–Levenshtein distance (Wikipedia)
		var levDist = function(s, t) {
			var d = []; //2d matrix

			// Step 1
			var n = s.length;
			var m = t.length;

			if (n == 0) return m;
			if (m == 0) return n;

			//Create an array of arrays in javascript (a descending loop is quicker)
			for (var i = n; i >= 0; i--) d[i] = [];

			// Step 2
			for (var i = n; i >= 0; i--) d[i][0] = i;
			for (var j = m; j >= 0; j--) d[0][j] = j;

			// Step 3
			for (var i = 1; i <= n; i++) {
				var s_i = s.charAt(i - 1);

				// Step 4
				for (var j = 1; j <= m; j++) {

					//Check the jagged ld total so far
					if (i == j && d[i][j] > 4) return n;

					var t_j = t.charAt(j - 1);
					var cost = (s_i == t_j) ? 0 : 1; // Step 5

					//Calculate the minimum
					var mi = d[i - 1][j] + 1;
					var b = d[i][j - 1] + 1;
					var c = d[i - 1][j - 1] + cost;

					if (b < mi) mi = b;
					if (c < mi) mi = c;

					d[i][j] = mi; // Step 6

					//Damerau transposition
					if (i > 1 && j > 1 && s_i == t.charAt(j - 2) && s.charAt(i - 2) == t_j) {
						d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
					}
				}
			}

			// Step 7
			return d[n][m];
		}

		// Read all data
		var commonData = JSON.parse(fs.readFileSync(__dirname + '/public/output/all-data.json', "utf8")),
			langData = JSON.parse(fs.readFileSync(__dirname + '/public/output/ru/lang-data.json', "utf8")),
			summData = [];

		// Parsing English articles and collecting their titles
		for (var section in commonData) {
			for (var property in commonData[section]) {
				for (var article = 0; article < commonData[section][property].length; article++ ) {
					summData.push( commonData[section][property][article].title );
				}
			}
		}

		// Parsing Russian articles and collecting their titles
		for (var section in langData) {
			for (var property in langData[section]) {
				for (var article = 0; article < langData[section][property].length; article++ ) {
					summData.push( langData[section][property][article].title );
				}
			}
		}

		// Getting Levenstein  distance for paie "each title — new title"
		for (var articleTitle = 0; articleTitle < summData.length; articleTitle++) {
			if ( levDist( summData[articleTitle], title ) < LevenshteinThreshold ) {
				callback( false );
				return;
			}
		}

		callback( true );
	}

	/**
	* Run checks
	*/
	checkURLStatus(function(responce) {

		if (responce) {
			checkArticleFound(function(noSimilarTitles) {

				if (noSimilarTitles) {
					res.send({
						status: true,
						message: 'OK'
					});
				} else {
					res.send({
						status: false,
						message: 'Article with this title already exists'
					});
				}
			})
		} else {
			res.send({
				status: false,
				message: 'Page not found'
			});
		}
	})
});


/* Localization */
app.use(function (req, res, next) {
    global.currentLang = req.session.lang || 'en';
//console.log('--- currentLang', currentLang);
    next();
});

app.post('/lang', function (req, res, next) {
    console.log('========== new ==========');

// todo: dmitryl: geoapi predict part will be here

    currentLang = req.body.lang || 'en';
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

console.log('=== INDEX DATA', indexData, global.currentLang);

    arr.map(function(item) {
//        app.get(item, function(req, res) {
            var indexJson = { records: indexData };

            indexJson.commonOpts = global.commonOpts;

console.log('====== INDEX DATA inner', indexData, global.currentLang);

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

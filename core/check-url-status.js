var http = require('http')
	, parseurl = require('url')
	;


/**
* Check url on availability
* @param {Object} req — http request data
* @param {String} req.query.url — url for test
* @param {Object} res — response object
*/
var checkURLService = function ( req, res ) {
	var url = req.query.url;

    if (url) {
        checkURL(url, function(okay){
            if (okay) {
                res.send({
                    status: true
                });
            } else {
                res.send({
                    status: false,
                    message: global.opts.validate.urlFail
                });
            }
        });
    } else {
        res.send({
            status: false,
            message: global.opts.validate.urlEmpty
        });
    }

};

var checkURL = function ( plainUrl, callback ) {
    var url = parseurl.parse( plainUrl ),
        firstRequestReady = false;

	var optionsget = {
		hostname : url.host,
		port : 80,
		path : url.path,
		method : 'GET'
	};

	// Make http request and check for statusCode — 2xx and 3xx accepted, otherwise fails
	var getData = function getData() {
		var reqGet = http.request(optionsget, function(response) {

			response.on('data', function(data) {

                if (!firstRequestReady) {
                   if ( (response.statusCode.toString().charAt(0) !== '2') && (response.statusCode.toString().charAt(0) !== '3') ) {
                        callback(false);
                    } else {
                        callback(true);
                    }
                }

                firstRequestReady = true;

			});

		});

		reqGet.end();
		reqGet.on('error', function(e) {
			callback(false);
		});

	}();
};

module.exports = {
	checkURL: function(url, callback) {
		checkURL(url, callback)
	},
	checkURLService: function(req, res) {
		checkURLService(req, res)
	}
};
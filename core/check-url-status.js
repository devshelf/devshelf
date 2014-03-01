var http = require('http')
	, parseurl = require('url')
	;


/**
* Check url on availability
* @param {Object} req — http request data
* @param {String} req.query.url — url for test
* @param {Object} res — response object
*/
var checkURLStatus = function ( req, res ) {
	var url = parseurl.parse( req.query.url );

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

				if ( (response.statusCode.toString().charAt(0) !== '2') && (response.statusCode.toString().charAt(0) !== '3') ) {
					res.send(false);
				} else {
					res.send(true);
				}

			});

		});

		reqGet.end();
		reqGet.on('error', function(e) {
			res.send(false);
		});

	}();
};

module.exports = {
	checkURLStatus: function(req, res) {
		checkURLStatus(req, res)
	}
};
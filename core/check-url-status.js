var request = require('request');

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
                    message: 'urlFail'
                });
            }
        });
    } else {
        res.send({
            status: false,
            message: 'urlEmpty'
        });
    }

};

var checkURL = function ( plainUrl, callback ) {
    var url = plainUrl;

	request({
        url: url,
        timeout: 5000
    }, function (error, response) {
        if (!error && response.statusCode.toString().charAt(0) === '2') {
            callback(true);
        } else {
            callback(false);
        }
    });
};

module.exports = {
	checkURL: function(url, callback) {
		checkURL(url, callback)
	},
	checkURLService: function(req, res) {
		checkURLService(req, res)
	}
};
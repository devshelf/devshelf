var checkURL = require('./check-url-status'),
    checkTitle = require('./check-title');

/**
* Submit validator
* @param {Object} req — http request data
* @param {String} req.query.title — title of new article
* @param {String} req.query.url — url of new article
* @param {Object} res — response object
*/
var validateService = function(req, res) {
    var title = req.query.title,
        url = req.query.url,
        lang = req.query.lang;

    if (title && url) {
        validate(title, url, lang, function(okay, msg){
            if (okay) {
                res.send({
                    status: true,
                    message: msg
                });
            } else {
                res.send({
                    status: false,
                    message: msg
                });
            }
        });
    } else {
        res.send({
            status: false,
            message: 'noData'
        });
    }
};

var validate = function(title, url, lang, callback) {
    checkTitle.checkTitle(title, lang, function(titleOk, msg){
        if (titleOk) {

            checkURL.checkURL(url, function(urlOK, msg){
                if (urlOK) {
                    callback(true, 'OK');
                } else {
                    callback(false, 'urlFail');
                }
            });

        } else {
            callback(false, 'titleFail');
        }
    });
};

module.exports = {
	validateService: function(req, res) {
		validateService(req, res);
	},
	validate: function(title, url, callback) {
		validate(title, url, callback)
	}
};
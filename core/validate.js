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
        url = req.query.url;

    if (title && url) {
        validate(title, url, function(okay, msg){
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
            message: global.opts.validate.noData
        });
    }
};

var validate = function(title, url, callback) {
    checkTitle.checkTitle(title, function(titleOk, msg){
        if (titleOk) {

            checkURL.checkURL(url, function(urlOK, msg){
                if (urlOK) {
                    callback(true, 'OK');
                } else {
                    callback(false, global.opts.validate.urlFail);
                }
            });

        } else {
            callback(false, global.opts.validate.titleFail);
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
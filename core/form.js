var base64_decode = require('base64').decode,
    extend = require('extend'),
    github = require('octonode'),
    checkURL = require('./check-url-status'),
    checkTitle = require('./check-title');

//TODO: if has fork, create a branch in it, merge with latest devshelf and commit
//TODO: check existance of article in fork

var postArticle = function(req, res){
    var user = typeof req.session.authCache === 'undefined' ?  undefined : req.session.authCache.github.user.login;

    if (user === undefined) {
        res.send({
            status: false,
            message: "Unauthorized"
        });
    } else {
        validateData(req.query, function(validateStatus){
            if (validateStatus) {
                fork(req, res, function(err, data){
                    res.send({
                        status: true,
                        message: "PR created",
                        data: data
                    });
                });
            } else {
                res.send({
                    status: false,
                    message: "Validation failed"
                });
            }
        });
    }
};

var fork = function(req, res, callback) {
    var client = github.client(req.query.token),
        ghme   = client.me();

    //Get user repos and start process
    ghme.repos(function(err, data) {
        if (err) { GhApiOnErr(req, res, err); return; }

        var hasFork = false;

        data.map(function(item){
           if (item.full_name === req.query.login+'/'+global.opts.github.repoName) {
               hasFork = true;
           }
        });

        var proceedToFileEdit = function() {
            editFile(req, res, function(){
                pullRequest(req, res, function(err, data){

                    callback(err, data);
                });
            });
        };

        if (hasFork) {
//            console.log('he have fork');

            proceedToFileEdit();
        } else {
//            console.log('no fork');

            //Creating fork
            ghme.fork(global.opts.form.masterRepo, function(err, data){
                if (err) { GhApiOnErr(req, res, err, 'Fork error'); return; }

//                console.log('fork done');

                proceedToFileEdit();
            });
        }
    });
};

//Editing file
var editFile = function(req, res, callback) {

    var client = github.client(req.query.token),
        ghrepo = client.repo(req.query.login+'/'+global.opts.github.repoName);

    ghrepo.contents('articles-data/'+req.query.cat+'.json', global.opts.form.PRbranch, function(err, currentFile){
        if (err) { GhApiOnErr(req, res, err, 'Error getting file contents from GitHub'); return; }

        //updating data
        try { //trying to parse JSON
            var fileContentInBase64 = currentFile.content,
                decodedContentObject = JSON.parse(base64_decode(fileContentInBase64));
        } catch (err) {
            GhApiOnErr(req, res, err, 'Error parsing current cat JSON'); return;
        }


        try { //trying to push new object
            var tagDataArr = decodedContentObject[req.query.cat];
                tagDataArr.push(req.query.postData);
        } catch (err) {
            GhApiOnErr(req, res, err, 'Error pushing new object to JSON'); return;
        }


        //comiting updated data
        ghrepo.updateContents(currentFile.path, global.opts.form.commitMessage, JSON.stringify(decodedContentObject, false, 4), currentFile.sha, global.opts.form.PRbranch, function(err, data){
            if (err) { GhApiOnErr(req, res, err, 'Update error'); return; }
//            console.log('update done');

            callback(err, data);
        });
    });
};

var pullRequest = function(req, res, callback) {
    var client = github.client(req.query.token),
        ghrepoMaster = client.repo(global.opts.form.masterRepo);

//    console.log('PR start');

    ghrepoMaster.pr({
      "title": global.opts.form.PRtitlePrefix+req.query.postData.title+global.opts.form.PRtitlePostfix+req.query.cat,
      "body": global.opts.form.PRdescription,
      "head": req.query.login+":"+global.opts.form.PRbranch,
      "base": global.opts.form.PRbranch
    }, function(err, data) {
        if (err) { GhApiOnErr(req, res, err, 'PR error'); return; }
//        console.log('PR done');

        callback(err, data);
    });
};

//Validating input data
var validateData = function(data, callback) {

    var checkCat = function(){
        var valid = false;

        if (typeof global.articlesData[global.opts.l18n.defaultLang][data.cat] === 'object') {
            valid = true;
        }

        return valid;
    };

    var checkTag = function(){
        var valid = false;

        if (typeof data.postData.tags === 'object' && data.postData.tags.length > 0) {
            valid = true;
        }

        return valid;
    };

    //if url and title exists
    if (checkCat() && checkTag() && data.postData.url && data.postData.title) {

        //url is responding
        checkURL.checkURL(data.postData.url, function(urlAccesible){
           if (urlAccesible) {

               //article is unique
                checkTitle.checkTitle(data.postData.title, function(uniqueArticle){
                    if (uniqueArticle) {

                        callback(true);

                    } else { callback(false);}

                })

           } else { callback(false);}
        });

    } else { callback(false);}
};

//Validating input data
var GhApiOnErr = function(req, res, err, msg) {
    var message = msg || 'GitHub error';

    console.log('Error: '+ message, '| JS message: '+err);

    res.send({
        statusCode: 500,
        message: message
    });
};

/* Export */
module.exports = {
    editFile: function(req, res){
        editFile(req, res);
    },
    pullRequest: function(req, res){
        pullRequest(req, res);
    },
    postArticle: function(req, res){
        postArticle(req, res);
    }
};
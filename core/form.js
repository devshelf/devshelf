var github = require('octonode');
var checkURL = require('./check-url-status');
var checkTitle = require('./check-title');

//TODO: if has fork, create a branch in it, merge with latest devshelf and commit OR refork
//TODO: check existance of new article in fork

var postArticle = function(req, res){
    var user = typeof req.session.authCache === 'undefined' ?  undefined : req.session.authCache.github.user.login;

    if (user === undefined) {
        res.send({
            status: false,
            message: "unauthorized"
        });
    } else {
        validateData(req.query, function(validateStatus){
            if (validateStatus) {
                fork(req, res, function(err, data){

                    //Callback from PR (final step)
                    res.send({
                        status: true,
                        message: "PRcreated",
                        data: data
                    });
                });
            } else {
                res.send({
                    status: false,
                    message: "validationFailed"
                });
            }
        });
    }
};

var fork = function(req, res, callback) {
    var token = req.query.token || req.session.authCache.github.accessToken,
        client = github.client(token);

    if (typeof client === "undefined") {
        res.send({
            status: false,
            message: "unauthorized"
        });

        return false;
    }

    var ghme   = client.me();

    //Get user repos and start process
    ghme.repos(function(err, data) {
        if (err) { GhApiOnErr(req, res, err); return; }

        var hasFork = false;

        data.map(function(item){
           if (item.full_name === req.query.login+'/'+global.opts.articles.repoName) {
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
                if (err) { GhApiOnErr(req, res, err, 'forkError'); return; }

//                console.log('fork done');

                proceedToFileEdit();
            });
        }
    });
};

//Editing file
var editFile = function(req, res, callback) {
    var token = req.query.token || req.session.authCache.github.accessToken,
        client = github.client(token),
        ghrepo = client.repo(req.query.login+'/'+global.opts.articles.repoName),
        langDir = req.query.lang === global.opts.l18n.defaultLang ? '' : req.query.lang + '/';

    ghrepo.contents(langDir+req.query.cat+'.json', global.opts.form.PRbranch, function(err, currentFile){
        if (err) { GhApiOnErr(req, res, err, 'contentsError'); return; }

        //updating data
        try { //trying to parse JSON
            var fileContentInBase64 = currentFile.content;
            var decodedContentObject = JSON.parse(new Buffer(fileContentInBase64, 'base64').toString('utf8'));

        } catch (err) {
            GhApiOnErr(req, res, err, 'JSONError'); return;
        }


        try { //trying to push new object
            var tagDataArr = decodedContentObject[req.query.cat];
                tagDataArr.push(req.query.postData);
        } catch (err) {
            GhApiOnErr(req, res, err, 'JSONPushError'); return;
        }


        //comiting updated data
        ghrepo.updateContents(currentFile.path, global.opts.form.commitMessage, JSON.stringify(decodedContentObject, false, 4), currentFile.sha, global.opts.form.PRbranch, function(err, data){
            if (err) { GhApiOnErr(req, res, err, 'updateError'); return; }
//            console.log('update done');

            callback(err, data);
        });
    });
};

var pullRequest = function(req, res, callback) {
    var token = req.query.token || req.session.authCache.github.accessToken,
        client = github.client(token),
        ghrepoMaster = client.repo(global.opts.form.masterRepo);

//    console.log('PR start');

    ghrepoMaster.pr({
      "title": global.opts.form.PRtitlePrefix+req.query.postData.title+global.opts.form.PRtitlePostfix+req.query.cat,
      "body": global.opts.form.PRdescription,
      "head": req.query.login+":"+global.opts.form.PRbranch,
      "base": global.opts.form.PRbranch
    }, function(GHMasterErr, GHMasterData) {
        if (GHMasterErr) {

            //On error we're checking if user already left PR
            ghrepoMaster.prs(function(err, data){
                var PRsArr = data,
                    hasPR = false;

                PRsArr.map(function(item){

                   //if its users PR and was automatically created earlier
                   if (item.user.login === req.query.login && item.body === global.opts.form.PRdescription) {
                        hasPR = true;

                       callback(err, item);
                   }
                });

                //if user don't have PRs, pass erorr
                if (!hasPR) {
                    GhApiOnErr(req, res, GHMasterErr, 'PRError'); return;
                }

            });
        } else {
//            console.log('PR done');

            callback(GHMasterErr, GHMasterData);
        }

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
                checkTitle.checkTitle(data.postData.title, data.lang, function(uniqueArticle){
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
    var message = msg || 'GHError';

    console.log('Form Error: '+ message, '| JS message: '+err);

    res.send({
        statusCode: 500,
        status: false,
        message: message,
        description: err
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
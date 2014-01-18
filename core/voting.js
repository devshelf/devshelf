var colors = require('colors'),
    mongoose = require('mongoose');


/* Connect to DB */
var dbAdress = 'mongodb://' + global.opts.remoteDBhost + ':' + global.opts.remoteDBport +'/votes';

mongoose.connection.on("connecting", function() {
    return console.log("Started connection on " + (dbAdress).cyan + ", waiting for it to open...".grey);
});
mongoose.connection.on("open", function() {
    return console.log("MongoDB connection opened!".green);
});
mongoose.connection.on("error", function(err) {
    console.log("Could not connect to mongo server!".red);
    return console.log(err.message.red);
});

mongoose.connect(dbAdress);
/* /Connect to DB */


/* Common */
var notInArray = function(item, array){
    var notInArray = true,
        i = 0;

    while (i < array.length) {

        if (array[i] === item) {
            notInArray = false;
        }

        i++;
    }

    return notInArray;
};

var removeFromArray = function removeA(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
};

var checkVotesId = function(id, lang) {
    var currentID = id,
        response = false,
        currentLanguage = lang;

    // Check if our ID exists
    if (global.articlesIDs[currentLanguage].length !== 0 && global.articlesIDs[currentLanguage].indexOf(currentID) !== -1) {
        response = true;
    }

    return response;
};
/* /Common */


/* Mongo model */

//Schema
var vote = mongoose.Schema({
    _id: String,
    plusVotes: Number,
    plusVotesUsers: Array,
    minusVotes: Number,
    minusVotesUsers: Array
});

var prepareMongoModel = function(lang) {
    var mongoCollection = 'votes',
        langDefault = global.opts.langDefault;

    if (lang !== langDefault) {
        mongoCollection = mongoCollection + '-' + lang;
    }

    console.log('collection', mongoCollection);

    return mongoose.model('Votes', vote, mongoCollection);
};

/* /Mongo model */


/* Module methods */
//Add positive vote
var makeVote = function(req, res, voteType){
    var id = req.query._id,
        user = typeof req.user === 'undefined' ?  undefined : req.user.github.login,
        oppositeVotesType;

    try {

    //TODO:dmitry pass user lang from session (from req)
    var lang = global.opts.tempCurrentLang;
    var Vote = prepareMongoModel(lang);

    if (user === undefined) { // Check user auth
        res.jsonp('unauthorized');
    } else if ( checkVotesId(id, lang) ) { // Validate ID
        if (voteType === 'plusVotes') {
            oppositeVotesType = 'minusVotes';
        } else if (voteType === 'minusVotes') {
            oppositeVotesType = 'plusVotes';
        }

        Vote.findById(id, function (err, data) {
            if (err) return res.jsonp(err);

            if (data === null) { //if not created, then create remote
                //Document
                var voteDocumentData = {
                    _id: id,
                    plusVotes: 0,
                    plusVotesUsers: [],
                    minusVotes: 0,
                    minusVotesUsers: []
                };

                voteDocumentData[voteType]= 1;
                voteDocumentData[voteType+'Users'] = [user];

                var vote = new Vote(voteDocumentData);

                vote.save(function (err, data) {
                    if (err) return res.jsonp(err);

                    res.jsonp(data);
    //                console.log(voteType+' save READY: ' + data);
                });

            } else { //if created, update remote with +one vote
                var dataToUpdate = {},
                    voteStats = checkVoting(data, voteType, oppositeVotesType, user);

                if( voteStats === 'voted' ){
                    res.jsonp(voteType+' already voted');
                } else {
                    var usersArray = data[voteType+'Users'],
                        oppositeUsersArray = data[oppositeVotesType+'Users'];

                    //Adding new user to voted list
                    usersArray.push(user);

                    //Adding vote
                    dataToUpdate[voteType] = data[voteType] + 1;

                    if ( voteStats === 'revoted' ) {
    //                    console.log(voteType+' REVOTED'.yellow);

                        //Removing opposite vote, if revoting
                        dataToUpdate[oppositeVotesType] = data[oppositeVotesType] - 1;

                        removeFromArray(oppositeUsersArray, user);
                        dataToUpdate[oppositeVotesType+'Users'] = oppositeUsersArray;
                    }

                    dataToUpdate[voteType+'Users'] = usersArray;

                    Vote.update({ _id: id }, { $set: dataToUpdate}, function(){
                        res.jsonp(voteType+' SUCCESS');
                        console.log(voteType+' SUCCESS'.green);
                    });

                }
            }
        })
    } else {
        res.jsonp('incorrect ID');
    }
    } catch (e) {
        console.log(e);
    }

};

var checkVoting = function(data, voteType, oppositeVotesType, username){
    var usersArray = data[voteType+'Users'],
        oppositeUsersArray = data[oppositeVotesType+'Users'];

    var voted = function() {
        var response = false;

        if (!notInArray(username, usersArray)) {
            response = true;
        }

        return response;
    };

    if ( voted() ) {
        return 'voted';
    } else {
        var response = 'not voted';

        var i = 0;
        while (i < oppositeUsersArray.length) {

            if (oppositeUsersArray[i] === username) {
                response = 'revoted';
            }

            i++;
        }

        return response;
    }

};

var getVotes = function(req, res) {
    var id = req.query._id;

    //TODO:dmitry pass user lang from session (from req)
    var lang = global.opts.tempCurrentLang;
    var Vote = prepareMongoModel(lang);

    Vote.findById(id, function (err, data) {
        if(!err) {
            res.jsonp(data);
        }
    })
};

var getAllVotes = function(req, res) {
    //TODO:dmitry pass user lang from session (from req)
    var lang = global.opts.tempCurrentLang;
    var Vote = prepareMongoModel(lang);

    Vote.find(function (err, votes) {
        if(!err) {
            res.jsonp(votes);
        }
    });
};
/* /Module methods */


/* All votes to json */
var fs = require('fs');

var generateVotingData = function(lang) {
    var langDefault = global.opts.langDefault,
        language = lang || langDefault,
        localizationEnabled = language !== langDefault,

        dataOutputDir = global.opts.dataOutputDir,

        articlesVoteFile = global.opts.articlesVoteFile;

    var Vote = prepareMongoModel(language);

    Vote.find(function (err, votes) {
        if (!err) {

            var generateJSON = function(data, dir, fileName) {
                var JSONformat = null;

                if (global.MODE === 'development') {
                    JSONformat = 4;
                }

                fs.writeFile(dir + fileName, JSON.stringify(data, null, JSONformat), function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Generating Voting data in ".green + dir.green + fileName.green + ": DONE".green);
                    }
                });
            };

            (function(votes) {
                var outputDir = global.appDir+dataOutputDir;

                if (localizationEnabled) {
                    outputDir = global.appDir+dataOutputDir+language+'/';
                }

                var processJSON = function(){
                    generateJSON(votes, outputDir, articlesVoteFile);
                };

                //Prepare output folder and write file
                fs.readdir(outputDir,function(e){
                    if(!e || (e && e.code === 'EEXIST')){
                        processJSON();
                    } else if (e.code === 'ENOENT') {
                        fs.mkdir(outputDir);
                        processJSON();
                    } else {
                        console.log(e);
                    }
                });
            })(votes);

        } else {
            console.log(err);

            console.log('WARN: Voting data not generated, check connection to DB'.yellow);
        }
    });
};

if (global.MODE === 'production') {
    // for waiting when function finished
    var NOT_RUNNING = true;

    setInterval(function() {
        if (NOT_RUNNING) {

            NOT_RUNNING = false;

            generateVotingData();

            NOT_RUNNING = true;

        }
    }, global.global.opts.votingDataCron);
}
/* /All votes to json */


/* Export */
module.exports = {
    plusVotes: function(req, res){
        makeVote(req, res, 'plusVotes');
    },

    minusVotes: function(req, res){
        makeVote(req, res, 'minusVotes');
    },

    getVotes: function(req, res){
        getVotes(req, res);
    },

    getAllVotes: function(req, res){
        getAllVotes(req, res);
    },

    generateVotingData: function(){
        generateVotingData();

        global.opts.additionalLanguages.map(function(item) {
            generateVotingData(item);
        });
    }
};
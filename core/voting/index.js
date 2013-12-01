var colors = require('colors'),
    mongoose = require('mongoose');


/* Connect to DB */
var dbAdress = 'mongodb://' + opts.remoteDBhost + ':' + opts.remoteDBport +'/votes';

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

var checkVotesId = function(id) {
    var currentID = id,
        response = false,
        existingIDs = [];

    // Getting actual data for existing ID lookup
    if (JSON.stringify(articlesData) === '{}') { //from global var or from file
        articlesData = JSON.parse(fs.readFileSync(appDir + '/public/output/all-data.json', "utf8")) || {};
    }

    // Preparing existing IDs list
    for(var cat in articlesData) {
        var currentCat = articlesData[cat];

        for(var obj in currentCat) {
            var targetArr = currentCat[obj];

            var i=0;
            while(i<targetArr.length){

                existingIDs.push(targetArr[i].id)

                i++;
            }
        }
    }

    // Check if our ID exists
    if (existingIDs.indexOf(currentID) !== -1) {
        response = true;
    }

    return response;
}
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

//Model
var Vote = mongoose.model('Votes', vote);

/* /Mongo model */


/* Module methods */
//Add positive vote
var makeVote = function(req, res, voteType){
    var id = req.query._id,
        user = typeof req.user === 'undefined' ?  undefined : req.user.github.login,
        oppositeVotesType;

    if (user === undefined) { // Check user auth
        res.jsonp('unauthorized');
    } else if ( checkVotesId(id) ) { // Validate ID
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

    Vote.findById(id, function (err, data) {
        if(!err) {
            res.jsonp(data);
        }
    })
};

var getAllVotes = function(req, res) {
    Vote.find(function (err, votes) {
        if(!err) {
            res.jsonp(votes);
        }
    });
};
/* /Module methods */


/* All votes to json */
var fs = require('fs');

var generateVotingData = function() {
    Vote.find(function (err, votes) {
        if (!err) {

            fs.readdir(appDir+'/public/output/',function(e){
                if(!e || (e && e.code === 'EEXIST')){
                    generateJSON();
                } else if (e.code === 'ENOENT') {
                    fs.mkdir(appDir+'/public/output/');
                    generateJSON();
                } else {
                    console.log(e);
                }
            });

            var generateJSON = function() {
                fs.writeFile(appDir+'/public/output/all-votes.json', JSON.stringify(votes), function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
            };

        } else {
            console.log(err);
        }
    })

    console.log('Generating Votind data - DONE'.green);
};

// for waiting when function finished
var NOT_RUNNING = true;

setInterval(function() {
    if (NOT_RUNNING) {

        NOT_RUNNING = false;

        generateVotingData();

        NOT_RUNNING = true;

    }
}, opts.votingDataCron);
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
    }
};
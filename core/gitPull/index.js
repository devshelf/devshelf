var exec = require('child_process').exec,
    articlesJson = require('../articles-json');

var userName = opts.pullUserName,
    password = opts.pullPassword;

// for waiting when function finished
var NOT_RUNNING = true;
// user who have permissions for git pull from repository;
setInterval(function() {
    if (NOT_RUNNING) {

        NOT_RUNNING = false;
        function commandLog(error, stdout, stderr) {
            console.log('stdout: ' + stdout);

            if (error !== null) {
                console.log('exec error: ' + error);
            }

            articlesJson.generateData();
            NOT_RUNNING = true;
        }
        console.log("Git Pull Process");
        exec('git pull https://'+userName+':'+password+'@'+opts.pullRepo, commandLog);
    }
},opts.articlesDataCron);

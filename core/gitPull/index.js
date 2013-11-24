var exec = require('child_process').exec;

// for waiting when function finished
var NOT_RUNNING = true;

var userName = opts.pullUserName;
var password = opts.pullPassword;

// user who have permissions for git pull from repository;
setTimeout(function() {
    if (NOT_RUNNING) {

        NOT_RUNNING = false;
        function commandLog(error, stdout, stderr) {
            console.log('stdout: ' + stdout);

            if (error !== null) {
                console.log('exec error: ' + error);
            }
            require('../../core/articles-json');
            NOT_RUNNING = true;
        }
        console.log("Git Pull Process");
        exec('git pull https://'+userName+':'+password+'@'+opts.pullRepo, commandLog);
    }
},opts.articlesDataCron);

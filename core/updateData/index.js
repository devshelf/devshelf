var exec = require('child_process').exec,
    articlesJson = require('../generate-data');

// for waiting when function finished
var NOT_RUNNING = true;
// user who have permissions for git pull from repository;

var updateData = function() {
    if (NOT_RUNNING) {

        NOT_RUNNING = false;

        function callback(error, stdout, stderr) {
            console.log('stdout: ' + stdout);

            if (error !== null) {
                console.log('exec error: ' + error);
            }

            articlesJson.generateData();
            NOT_RUNNING = true;
        }

        console.log("Git pull from reposity...");

        exec('git --work-tree='+ global.appDir +' --git-dir='+ global.appDir +'/.git pull --rebase', callback);
    }
};

if (global.MODE === 'production') {
    setInterval(function() {
        updateData();
    },global.opts.articlesDataCron);
}


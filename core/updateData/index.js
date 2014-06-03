var exec = require('child_process').exec,
    articlesJson = require('../generate-data');

// for waiting when function finished
var NOT_RUNNING = true;

var updateData = function() {
    if (NOT_RUNNING) {

        NOT_RUNNING = false;

        function callback(error, stdout, stderr) {
            if (global.MODE === 'development') {
                console.log('stdout: ' + stdout);
            }

            if (error !== null) {
                console.log('exec error: ' + error);
            }

            articlesJson.generateData();
            NOT_RUNNING = true;
        }

        if (global.MODE === 'development') {
            console.log("Git pull from reposity...");
        }

        exec('git --work-tree='+ global.appDir + global.opts.articles.path +' --git-dir='+ global.appDir + global.opts.articles.path +'/.git pull --rebase', callback);
    }
};

// Updating with interval in production mode
if (global.MODE === 'production') {
    setInterval(function() {
        updateData();
    }, global.opts.articles.updateInterval);
}

// Running once on first run
updateData();
var exec = require('child_process').exec;
var path = require('path');
var articlesJson = require('../generate-data');

// for waiting when function finished
var NOT_RUNNING = true;

var updateData = function() {
    var articlesPath = path.join(global.appDir, global.opts.articles.path);

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

        exec('git --work-tree='+ articlesPath +' --git-dir='+ articlesPath +'/.git pull --rebase', callback);
    }
};


if (global.MODE === 'production') {

    // Updating with interval in production mode
    setInterval(function() {
        updateData();
    }, global.opts.articles.updateInterval);

    // Running once on first run
    updateData();
}
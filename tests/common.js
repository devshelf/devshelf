casper.options.viewportSize = {width: 1024, height: 768};

casper.test.begin('Check JS errors', 1, function(test) {
    var error = {};

    casper.once("page.error", function onError(msg, trace) {
        error.msg = msg;
        error.trace = trace;
    });

    casper.start('http://127.0.0.1:8888').then(function() {

        if (typeof error.msg === 'string') {
            test.fail("JS errors found: "+error.msg);
        } else {
            test.pass("No JS errors");
        }

	}).run(function() { test.done() }).clear();
});
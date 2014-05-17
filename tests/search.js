casper.options.viewportSize = {width: 1024, height: 768};

casper.test.begin('Checking search', 3, function suite(test) {
	casper.start('http://127.0.0.1:8888').then(function() {

		test.assertExists('.js-search-input', 'Search input exists');

        this.fillSelectors('form.home-search', {
            '.js-search-input':'css'
        }, false);

        this.click('.js-search-button');

    }).then(function() {

        test.assertExists('#posts-output', 'Results exist after submit');

        test.assertEquals(this.getCurrentUrl(), 'http://127.0.0.1:8888/#!/search/css', 'URL is right')


	}).run(function() { test.done() }).clear();
});

casper.test.begin('Checking auto-suggest', 2, function suite(test) {
	casper.start('http://127.0.0.1:8888').then(function() {

		test.assertExists('.js-search-input', 'Search input exists');

        this.fillSelectors('form.home-search', {
            '.js-search-input':'css'
        }, false);

        this.sendKeys('.js-search-input', casper.page.event.key.Down);
        this.sendKeys('.js-search-input', casper.page.event.key.Enter);

    }).then(function() {

        test.assertExists('#posts-output', 'Results exist after submit');

//        this.capture('test.png');

	}).run(function() { test.done() }).clear();
});
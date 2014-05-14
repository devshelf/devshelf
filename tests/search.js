casper.test.begin('Checking search', 3, function suite(test) {
	casper.start('http://127.0.0.1:8888').then(function() {

		test.assertExists('.js-search-input', 'Search exists');

        this.fillSelectors('form.home-search', {
            '.js-search-input':'css'
        }, false);

        this.click('.js-search-button');

    }).then(function() {

        test.assertExists('#posts-output', 'Results exist');

        test.assertEquals(this.getCurrentUrl(), 'http://127.0.0.1:8888/#!/search/css', 'URL is right')


	}).run(function() { test.done() }).clear();
});
casper.test.begin('Site is available', 1, function suite(test) {
	casper.start('http://127.0.0.1').then(function() {

		test.assertDoesntExist('.pure-menu-heading', 'DevShelf');

	}).run(function() { test.done() }).clear();
});
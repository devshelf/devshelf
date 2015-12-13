casper.options.viewportSize = {width: 1024, height: 768};

casper.test.begin('Checking localization', 3, function suite(test) {
	casper.start('http://127.0.0.1:8888').then(function() {

        test.assertTextExists('Thanks to', 'English localization is ON');

        test.assertExists('.js-language.__ru', 'Language switching tumbler exists');

        this.click('.js-language.__ru');

    }).then(function() {

        casper.waitForSelector("html[lang='ru']", function() {
            casper.waitForSelector(".footer", function() {
              test.assertTextExists('Спасибо команде', 'Russion localization is turning ON');
          });
        });

	}).run(function() { test.done() }).clear();
});
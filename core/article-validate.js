/**
* Links validator
* @param {Object} req — http request data
* @param {String} req.query.url - url of new article
* @param {String} req.query.title — title of new article
* @param {Object} res — response object
*/

var articleValidate = function(req, res) {

	var url = req.query.url,
		title = req.query.title;

	/**
	* Check for already exists title
	*/
	function checkArticleFound( ) {

		// If leet than value, article title already exists
		var LevenshteinThreshold = 5;

		//http://www.merriampark.com/ld.htm, http://www.mgilleland.com/ld/ldjavascript.htm, Damerau–Levenshtein distance (Wikipedia)
		var levDist = function(s, t) {
			var d = []; //2d matrix

			// Step 1
			var n = s.length;
			var m = t.length;

			if (n == 0) return m;
			if (m == 0) return n;

			//Create an array of arrays in javascript (a descending loop is quicker)
			for (var i = n; i >= 0; i--) d[i] = [];

			// Step 2
			for (var i = n; i >= 0; i--) d[i][0] = i;
			for (var j = m; j >= 0; j--) d[0][j] = j;

			// Step 3
			for (var i = 1; i <= n; i++) {
				var s_i = s.charAt(i - 1);

				// Step 4
				for (var j = 1; j <= m; j++) {

					//Check the jagged ld total so far
					if (i == j && d[i][j] > 4) return n;

					var t_j = t.charAt(j - 1);
					var cost = (s_i == t_j) ? 0 : 1; // Step 5

					//Calculate the minimum
					var mi = d[i - 1][j] + 1;
					var b = d[i][j - 1] + 1;
					var c = d[i - 1][j - 1] + cost;

					if (b < mi) mi = b;
					if (c < mi) mi = c;

					d[i][j] = mi; // Step 6

					//Damerau transposition
					if (i > 1 && j > 1 && s_i == t.charAt(j - 2) && s.charAt(i - 2) == t_j) {
						d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
					}
				}
			}

			// Step 7
			return d[n][m];
		};

		// Read all data
		var summData = [];

		for (var field in global.articlesData) {
			for (var lang in global.articlesData[field]) {
				for (var section in global.articlesData[field][lang]) {
					for (var article = 0; article < global.articlesData[field][lang][section].length; article++ ) {
						summData.push( global.articlesData[field][lang][section][article].title );
					}
				}

			}
		}

		for (var articleTitle = 0; articleTitle < summData.length; articleTitle++) {
			if (title.length < 5) {
				if (summData[articleTitle].toUpperCase() == title.toUpperCase()) {

					res.send({
						status: false,
						message: 'Article with this title already exists'
					});

					return;
				}
			} else {
				// Getting Levenstein  distance for pair "each title — new title"
				if ( levDist( summData[articleTitle].toUpperCase(), title.toUpperCase() ) < LevenshteinThreshold ) {

					res.send({
						status: false,
						message: 'Article with this title already exists'
					});

					return;
				}

			}
		}

		res.send({
			status: true,
			message: 'OK'
		});
	}

	/**
	* Run checks
	*/
	if (url && title) {
		checkArticleFound(res);
	} else {
		res.send({
			status: false,
			message: 'Invalid parameters'
		});
	}
};

module.exports = {
	articleValidate: function(req, res) {
		articleValidate(req, res)
	}
};
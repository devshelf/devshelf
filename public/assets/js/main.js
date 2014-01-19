var TARGET_CONT = 'main-content',
    totalTagList = {},
    searchTagList = {},
    voteData = {},
    langData = {};

var isTouch = (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0));

var templateEngine = (function() {
    var hashStruct = {};

    return {

        /**
         * Filter results from all-data.json related to inserted word or this part;
         * @param {Object} opt Options for search
         * 0: {String} opt.qSearch query string
         * 1: {JSON} opt.allData JSON with articles
         * @returns {Array}
         * 0: {Object} full results with categories; need to upgrade mustache render func;
         * 1: {Array} lite version; can be used in mustache without workarounds;
         */
        fuzzySearch: function(opt) {
            var
                query = opt.q.toLowerCase(),
                qRegExp = new RegExp(query),
                allData = opt.allData,
                result = {},
                liteResult = [];

            for (k in allData) {
                var
                    prop = allData[k],
                    prop_l = prop.length;

                if (!prop_l) continue;

                /**
                 * if category successfully matches query tag
                 * - all categories articles goes to search output
                 * without matching;
                 */
                if ( qRegExp.test(k.match(query)) ) {
                    liteResult = liteResult.concat(prop);

                    if (!result[k]) result[k] = [];
                    result[k] = prop;
                }
                else {
                    /**
                     * if category doesn't match query, all
                     * inner articles has tested for tag field
                     */
                    for (var i=0; i < prop_l; i++) {

                        var
                            tags = prop[i].tags,
                            tags_l = tags? tags.length : 0;

                        if (!tags || !tags_l) continue;

                        for (var j=0; j < tags_l; j++) {
                            if ( qRegExp.test(tags[j].match(query)) ) {
                                if (!result[k]) result[k] = [];
                                result[k].push(prop[i]);
                                liteResult.push(prop[i]);
                            } else continue;
                        }
                    }
                }
            }

    //console.log('options', query, allData);
    //console.log('liteResult', liteResult);

            return [result, liteResult];
        },

        /**
         * Method extends tags section
         * @returns {Object} templateEngine
         */
        extendingTags: function() {
            for (k in searchTagList) {
                var
                    prop = searchTagList[k],
                    prop_l = prop.length;

                if (!prop_l) continue;

                for (var i=0; i < prop_l; i++) {
                    if (prop[i].tags === undefined) {
                        prop[i].tags = [];
                    }

                    for (var parentTags in totalTagList) {
                        if (!!totalTagList[parentTags][k]) {
                            prop[i].tags.unshift(parentTags);
                        }
                    }
                }
            }
            return this;
        },

        /**
         * Method build routing tree using data-urls attributes in exists templates
         * @param {Object} p
         * @param {Function} p.callback
         * @returns {Object} templateEngine
         */
        buildHashStruct: function(p) {
            var callback = p.callback || function() {};

            $('script[type="text/x-jquery-tmpl"][data-url]').each(function() {
                var dataUrl = $(this).attr('data-url');

                if (dataUrl !== '') {
                    hashStruct[dataUrl] = $(this).attr('id');
                }
            })

            callback();

            return this;
        },

        /**
         * Check url and define params for proper template rendering
         * @returns {Object} templateEngine
         */
        checkHash: function() {
            var currentWindowHash = window.location.hash.split('#!/');

            if (currentWindowHash[1]) this.query = currentWindowHash[1].split('/')[1];

            if (currentWindowHash.length > 1) {
                currentWindowHash = currentWindowHash[1];
                templateEngine.buildHashStruct({
                    callback: function() {

                        /**
                         * Rendering routine call just after routing tree creation
                         */
                        templateEngine.getTemplateByHash({
                            hash: currentWindowHash,
                            callback: function(p) {
                                templateEngine.insertTemplate(p);
                            }
                        })
                    }
                })
            } else {
                /**
                 * There's no any params
                 */
                templateEngine.insertTemplate( {
                    template: 'main-page',
                    target: 'main-content'
                } );
            }

            return this;
        },

        /**
         * Check url and define params for proper template rendering
         * @param {Object} p
         * @param {String} p.hash
         * @param {Function} p.callback
         * @returns {Object} templateEngine
         */
        getTemplateByHash: function(p) {
            var targetCont = 'main-page',
                hash = p.hash,
                callback = p.callback || function(p) {},
                getParams = p.hash.split('/')[1],
                resultList = [],
                target;

            if (!!getParams) {
                hash = p.hash.split('/')[0];
            } else {
                getParams = '';
            }

            if (hash !== '') {
            	if (!!hashStruct[hash]) {
                	targetCont = hashStruct[hash];
                } else {
                	var hashToSpaces = hash.replace(/\s+/g, '_');
                	if ( (hash.indexOf('_') !== -1) && (!!hashStruct[hashToSpaces]) ) {
               			targetCont = hashStruct[hashToSpaces];
                	}
                }
            }

            /**
             * Case of search is more complicated than others
             */
            if ((targetCont == 'search') && (!!getParams)) {
            	// Create a local copy of resultList
                $.extend(true, resultList, templateEngine.fuzzySearch({
                    q: getParams.replace(/_/g, ' '),
                    allData: searchTagList
                })[1]);

                for (var resultInstance = 0; resultInstance < resultList.length; resultInstance++) {
                	var resultItem = resultList[resultInstance];

					for (var resultTags = 0; resultTags < resultItem.tags.length; resultTags++) {
						var title = resultItem.tags[resultTags],
							link = title.replace(/\s+/g, '_');

						resultItem.tags[resultTags] = {
							tagTitle: title,
							tagLink:link
						}
					}
                }

                if (resultList.length) {
                    templateEngine.attachVotes(resultList);
                }

                templateEngine.insertTemplate( {
                    template: 'search',
                    params: {
                        getParams: getParams.replace(/_/g, ' '),
                        resultList: resultList
                    }
                });

                /**
                 * Render search categories template
                 */
                templateEngine.getCategoryByArticle({
                    query: getParams.replace(/_/g, ' '),
                    callback: function(p) {
                        templateEngine.insertTemplate(p);
                    }
                });

                /**
                 * Prepare data for result of search list rendering
                 */
                targetCont = 'search-output';
                target = 'posts-output';

            }

            /**
             * Callback trigger final part of template rendering
             */
            callback({
                template: targetCont,
                target: target,
                params: {
                    getParams: getParams.replace(/_/g, ' '),
                    resultList: resultList,
                    copy: indexJson.records.copy,
	                total: resultList.length,
                    votingEnabled: indexJson.commonOpts.voting.enabled
                }
            });

            return this;
        },

        /**
         * Template inserting and History changing
         * @param {Object} p
         * @param {String} p.target — target #id container for template inserting
         * @param {String} p.template — template #id
         * @param {Object} p.params — Mustache params
         * @param {Object} p.params.replaceHistory — flag for changing History
         * @param {String} p.params.url — custom URL in History
         * @param {String} p.params.title — custom Title in History*
         * @param {String} p.params.getParams — pseudo GET params in search module
         * @returns {Object} templateEngine
         */
        insertTemplate: function(p) {
            var target = p.target || TARGET_CONT;
                $template = $('#'+ p.template),
                $target = $('#'+ target);

            var params = $.extend({}, p.params, langData[p.template]);
            $target.html( Mustache.to_html( $template.html(), params) );

            var actualParams = $.extend({}, params),
                actualUrl = actualParams.url || $template.attr('data-url'),
                actualTitle = actualParams.title || $template.attr('title') || document.title,
                cleanHash = '/',
                getParams = !!actualParams.getParams
                    ? '/'+actualParams.getParams.replace(/\s+/gi, '_')
                    : '';

            if (!!actualParams.replaceHistory && actualParams.replaceHistory) {
                actualParams.actualTitle = actualTitle;
                actualParams.actualUrl = actualUrl !== ''
                    ? cleanHash + '#!/'+actualUrl + getParams
                    : cleanHash;

                window.history.pushState(null, actualParams.actualTitle, actualParams.actualUrl);

            }

            //TODO: move to custom callback
            if (!isTouch) {
                $('.js-search-input').focus();
            }

            return this;
        },

        /**
         * Generate links to article of the same categoty
         * @param {Object} p
         * @param {String} p.query — target article's tag
         * @param {Function} p.callback
         * @returns {Object} templateEngine
         */
        getCategoryByArticle: function(p) {
            var callback = p.callback || function(p) {},
                navList = [],
                template = 'nav-panel',
                target = 'nav-list',
                wasAdded = {},
                currentCategory;

            for (currentCategory in totalTagList) {

                for (testArticle in totalTagList[currentCategory]) {
                    if ( !new RegExp(p.query).test(testArticle.match(p.query)) ) {
                        continue;
                    }

                    for (var articleInCategory in totalTagList[currentCategory]) {

                        if (!!wasAdded[articleInCategory]) {
                            continue;
                        }

                        var currentArticleArray = totalTagList[currentCategory][articleInCategory];

                        navList.push( {
                            navLink: '/#!/search/' + articleInCategory.replace(/\s+/g, '_'),
                            navTitle: articleInCategory
                        } );

                        wasAdded[articleInCategory] = true;

                    }

                }
            }

            callback({
                template: template,
                target: target,
                params: {
                    navList: navList
                }
            });

            return this;
        },

        /**
        * Extending articles list with votes data and sorting list by desc
        * @param {Array} resultList
        */
        attachVotes: function(resultList) {
            //var outResult = [];

            for (var i = 0; i < resultList.length; i++ ) {
                if ( !!voteData[resultList[i].id] ) {
                    resultList[i].votes = voteData[resultList[i].id].plusVotes - voteData[resultList[i].id].minusVotes;
                    if (resultList[i].votes > 0) {
                        resultList[i].popularity = 'positive'
                    } else if (resultList[i].votes < 0) {
                        resultList[i].popularity = 'negative'
                    }
                    else {
                        resultList[i].popularity = 'neutral'
                    }
                } else {
                    resultList[i].votes = 0;
                    resultList[i].popularity = 'neutral'
                }
            }

            resultList.sort(function (a, b) {
                if (a.votes > b.votes)
                    return -1;
                if (a.votes < b.votes)
                    return 1;
                // a must be equal to b
                return 0;
            });

            return this;
        }
    }
})();

var mainApp = function() {

    /**
     * Change banner background
     */

    $("#main-content").on('mouseenter', '.pricing-table', function(){
        var _this = $(this);
        if (_this.is('[class*=css]')) {
            $(".banner").attr('class','banner __css');
        } else if (_this.is('[class*=html]')) {
            $(".banner").attr('class','banner __html');
        } else {
            $(".banner").attr('class','banner');
        }
    });

    /**
     * Onready template rendering
     */
    templateEngine.checkHash();

    /**
     * On Back/Forward buttons press template render
     */
    window.addEventListener('popstate', function(e) {
    	templateEngine.checkHash();
    });

    /**
    * Language buttons events
    */
    $('.pure-menu').on('click', '.js-language', function() {
        // TODO: dmitryl: check list below
        // [*] move this check to data-*

    	var lang = $(this).hasClass('__ru')? 'ru' : 'en';

    	var makeRedirect = function() {
    		$.ajax({
    			url: '/lang',
    			type: 'POST',
    			data: {
    				curr: window.location.hash,
    				lang: lang
    			},
    			success: function() {
    				window.location.reload();
    			}
    		})
    	};

    	makeRedirect();

    });

    /**
     * Search field on main page
     */
    $('#main-content').on('click', '.js-search-button', function(e) {
         e.preventDefault();

         var searchQuery = $.trim($('.js-search-input').val()),
             resultList = [];

        $.extend(true, resultList, templateEngine.fuzzySearch({
            q: searchQuery,
            allData: searchTagList
        })[1]);

		for (var resultInstance = 0; resultInstance < resultList.length; resultInstance++) {
			var resultItem = resultList[resultInstance];

			for (var resultTags = 0; resultTags < resultItem.tags.length; resultTags++) {
				var title = resultItem.tags[resultTags],
					link = title.replace(/\s+/g, '_');

				resultItem.tags[resultTags] = {
					tagTitle: title,
					tagLink:link
				}
			}
		}

        if (resultList.length) {
            templateEngine.attachVotes(resultList);
        }

        templateEngine.insertTemplate( {
            template: 'search',
            params: {
                replaceHistory: true,
                getParams: searchQuery,
                total: resultList.length,
                resultList: resultList,
                votingEnabled: indexJson.commonOpts.voting.enabled
            }
        });

        templateEngine.insertTemplate( {
            template: 'main-page2',
            target: "main-source"
        });

        templateEngine.insertTemplate( {
            target: 'posts-output',
            template: 'search-output',
            params: {
                getParams: searchQuery,
                total: resultList.length,
                resultList: resultList,
                votingEnabled: indexJson.commonOpts.voting.enabled
            }
        });

        templateEngine.getCategoryByArticle({
            query: searchQuery,
            callback: function(p) {
                templateEngine.insertTemplate(p);
            }
        })


    });

    /**
     * Search field on search page
     */
    $('#main-content').on('keyup', '.js-search-input-interactive', function() {

        var searchQuery = $.trim($('.js-search-input').val()),
            resultList = [];

        $.extend(true, resultList, templateEngine.fuzzySearch({
            q: searchQuery,
            allData: searchTagList
        })[1]); // 1 - liteMode

		for (var resultInstance = 0; resultInstance < resultList.length; resultInstance++) {
			var resultItem = resultList[resultInstance];

			for (var resultTags = 0; resultTags < resultItem.tags.length; resultTags++) {
				var title = resultItem.tags[resultTags],
					link = title.replace(/\s+/g, '_');

				resultItem.tags[resultTags] = {
					tagTitle: title,
					tagLink:link
				}
			}
		}

        if (resultList.length) {
			templateEngine.attachVotes(resultList);

            templateEngine.insertTemplate( {
                target: 'posts-output',
                template: 'search-output',
                params: {
                    getParams: searchQuery,
                    total: resultList.length,
                    resultList: resultList,
                    votingEnabled: indexJson.commonOpts.voting.enabled
                }
            });

            templateEngine.getCategoryByArticle({
                query: searchQuery,
                callback: function(p) {
                    templateEngine.insertTemplate(p);
                }
            })

        }
    })
};

/**
 *
 * @returns {Object}    cookie string parsed into object
 */
function cookieParser() {
    var
        cookie = {},
        c = document.cookie.split('; '),
        cLen = c.length,
        arr;

    for (var i=0; i<cLen; i++) {
        arr = c[i].split('=');
        cookie[arr[0]] = arr[1];
    }

    return cookie;
}


/**
* Localization module on client
* Getting articles and voting data for specific language
*/
var getJsonData = function(p) {
	var
        currentLanguage,
		languages = {
			en: {
				data: 'output/all-data.json',
				votes: 'output/all-votes.json'
			},
			ru: {
				data: 'output/ru/all-data.json',
				votes: 'output/ru/all-votes.json'
			}
		},
		callback = p.callback || function() {};

    /**
     * Getting actual articles data
     * @param {Object} p
     * @param {Function} p.callback
     * @param {String} p.jsonData — path to json articles data
     */
    var getAllData = function(p) {
        var callback = p.callback || function() {};

        $.ajax({
            url: p.jsonData,
            success: function(data) {
                totalTagList = $.extend(true, totalTagList, data);

                for (var section in data) {
                    searchTagList = $.extend(true, searchTagList, data[section]);
                }

                templateEngine.extendingTags();

                callback();
            }
        })
    }

    /**
     * Getting actual voting data
     * @param {Object} p
     * @param {String} p.jsonData — path to json votes data
     * @param {String} p.language — setting for database output
     */
    var getVoteData = function(p) {
        var callback = p.callback || function() {};

        var dataUrl = p.jsonData,
            cacheNeeded = true;

        //If logged, give latest info
        if(indexJson.commonOpts.voting.enabled && localStorage['user']) {
            dataUrl = '/getAllVotes';
            cacheNeeded = false
        }

        //If not logged, give cached latest info
        $.ajax({
            cache: cacheNeeded,
            data: p.language,
            url: dataUrl,
                success: function(data) {
                    var votesJSON = data;

                    var voteLength = data.length;
                    while(voteLength--) {
                        voteData[ votesJSON[voteLength]['_id'] ] = votesJSON[voteLength];
                    }

                    callback();
                }
        })

    };

	// if p.lang not set, it equals to 'en'
	currentLanguage = (languages[p.lang])? p.lang : 'en';
//console.log('currentLanguage', currentLanguage);

    // extend templates with correct language
    var getLangData = function(callback) {
        var cb = callback || function() {}
          , path = (currentLanguage === 'en') ? '' : '/ru/'
          ;

        $.ajax({
            url: ''+path+'template-data.json',
            success: function(data) {
                langData = $.extend(true, langData, data);
                cb();
            }
        })
    };

	// Execution getting operations
    getAllData({
    	jsonData: languages[currentLanguage]['data'],
    	callback: function() {
			getVoteData({
				jsonData: languages[currentLanguage]['votes'],
				language: {
					lang: currentLanguage
				},
				callback: function() {
                    getLangData(callback);
				}
			})
    	}
    })
};

/**
 * Onstart routines
 */
var currentLanguage = cookieParser(document.cookie)['lang'] || 'en';

$(function() {

    /**
     * Gets templates and starts The App
     */
    var prepateTemplates = function() {
        $.ajax({
            url: "build/templates.html",
            cache: false,
            success: function(data) {
                $('body').append(data);
                mainApp();
                checkAuth();
            },
            dataType: 'text'
        })
    };

    /**
     * Getting data and rendering templates
     */
    getJsonData({
    	lang: currentLanguage,
    	callback: function() {
	    	prepateTemplates();
    	}
    })
});

/**
 * Mobile UI: hidden menus togglers
 */

$(function(){
	//var mobileParts = $('.mobile-menu-part');

	$('.pure-menu, #main-content').on('click', '.mobile-menu-toggle', function(){
		var _this = $(this);

		_this.toggleClass('pure-button-active');
		_this.parents('div').find('.mobile-menu-part').toggleClass('__active');

	});

});

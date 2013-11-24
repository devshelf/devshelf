var TARGET_CONT = 'main-content',
    totalTagList = {},
    searchTagList = {},
    voteData = {};

var templateEngine = (function() {
    var hashStruct = {};

    return {

        /**
         * Filter results from all-data.json related to inserted word or this part;
         * @param {Object} opt
         * @returns {Array}
         *  -> [0] full results with categories; need upgrade mustache render func;
         *  -> [1] lite version; can be used in mustache without workarounds;
         */
        fuzzySearch: function(opt) {
            var
                query = opt.q,
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
                resultList,
                target;

            if (!!getParams) {
                hash = p.hash.split('/')[0]
            }

            if ((hash !== '') && (!!hashStruct[hash])) {
                targetCont = hashStruct[hash];
            }

            /**
             * Case of search is more complicated than others
             */
            if ((targetCont == 'search') && (!!getParams)) {
                resultList = templateEngine.fuzzySearch({
                    q: getParams,
                    allData: searchTagList
                })[1];

                if (!!resultList) {
                    templateEngine.attachVotes(resultList);
                }

                templateEngine.insertTemplate( {
                    template: 'search',
                    params: {
                        getParams: getParams,
                        resultList: resultList
                    }
                });

                /**
                 * Render search categories template
                 */
                templateEngine.getCategoryByArticle({
                    query: getParams,
                    callback: function(p) {
                        templateEngine.insertTemplate(p);
                    }
                })

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
                    getParams: getParams,
                    resultList: resultList,
                    copy: indexJson.records.copy
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
                $target = $('#'+ target)

            $target.html( Mustache.to_html( $template.html(), p.params) );

            var actualParams = $.extend({}, p.params),
                actualUrl = actualParams.url || $template.attr('data-url'),
                actualTitle = actualParams.title || $template.attr('title') || document.title,
                cleanHash = '/',
                getParams = !!actualParams.getParams
                    ? '/'+actualParams.getParams
                    : '';

            if (!!actualParams.replaceHistory && actualParams.replaceHistory) {
                actualParams.actualTitle = actualTitle;
                actualParams.actualUrl = actualUrl !== ''
                    ? cleanHash + '#!/'+actualUrl + getParams
                    : cleanHash;

                window.history.pushState(null, actualParams.actualTitle, actualParams.actualUrl);

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
                            navLink: '/#!/search/' + articleInCategory,
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

        attachVotes: function(resultList) {
            //var outResult = [];

            for (var i = 0; i < resultList.length; i++ ) {
                if ( !!voteData[resultList[i].id] ) {
                    resultList[i].votes = voteData[resultList[i].id].plusVotes - voteData[resultList[i].id].minusVotes;
                } else {
                    resultList[i].votes = 0;
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

//            console.log(resultList);

            return this;
        }
    }
})();

var mainApp = function() {
    /**
     * Onready template rendering
     */
    templateEngine.checkHash();

    /**
     * On Back/Forward buttons press template render
     */
    window.addEventListener('popstate', function(e) {
        templateEngine.checkHash();
    })

    /**
     * Search field on main page
     */
    $('#main-content').on('click', '.js-search-button', function(e) {
         e.preventDefault();

         var searchQuery = $('.js-search-input').val(),
             resultList;

        resultList = templateEngine.fuzzySearch({
            q: searchQuery,
            allData: searchTagList
        })[1];

        if (!!resultList) {
            templateEngine.attachVotes(resultList);
        }

        templateEngine.insertTemplate( {
            template: 'search',
            params: {
                replaceHistory: true,
                getParams: searchQuery,
                total: resultList.length,
                resultList: resultList
            }
        });

        templateEngine.insertTemplate( {
            target: 'posts-output',
            template: 'search-output',
            params: {
                getParams: searchQuery,
                total: resultList.length,
                resultList: resultList
            }
        })

        templateEngine.getCategoryByArticle({
            query: searchQuery,
            callback: function(p) {
                templateEngine.insertTemplate(p);
            }
        })


    })

    /**
     * Search field on search page
     */
    $('#main-content').on('keyup', '.js-search-input-interactive', function() {

        var searchQuery = $('.js-search-input').val(),
            resultList;

        resultList = templateEngine.fuzzySearch({
            q: searchQuery,
            allData: searchTagList
        })[1]; // 1 - liteMode

        if (!!resultList) {
            for (var i = 0; i < resultList.length; i++ ) {
                if ( !!voteData[resultList[i].id] ) {
                    resultList[i].votes = voteData[resultList[i].id].plusVotes - voteData[resultList[i].id].minusVotes;
                } else {
                    resultList[i].votes = 0;
                }
            }

            templateEngine.insertTemplate( {
                target: 'posts-output',
                template: 'search-output',
                params: {
                    getParams: searchQuery,
                    total: resultList.length,
                    resultList: resultList
                }
            })

            templateEngine.getCategoryByArticle({
                query: searchQuery,
                callback: function(p) {
                    templateEngine.insertTemplate(p);
                }
            })

        }
    })
}

/**
 * Onstart routines
 */
$(function() {

    /**
     * Getting actual articles data
     * @param callback
     */
    var getAllData = function(callback) {
        var callback = callback || function() {};

        $.ajax({
            url: 'output/all-data.json',
            success: function(data) {
                totalTagList = $.extend(true, totalTagList, data);

                for (var section in data) {
                    searchTagList = $.extend(true, searchTagList, data[section]);
                }

                templateEngine.extendingTags();
//debug
alldata = searchTagList;
                callback();
            }
        })
    }

    /**
     * Getting actual voting data
     * @param callback
     */
    var getVoteData = function(callback) {
        var callback = callback || function() {};

        var dataUrl = 'output/all-votes.json',
            cacheNeeded = true;

        //If logged, give latest info
        if(localStorage['user']) {
            dataUrl = '/getAllVotes';
            cacheNeeded = false
        }

        //If not logged, give cached latest info
        $.ajax({
            cache: cacheNeeded,
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

    }

    /**
     * Getting templates and starts The App
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
    }

    /**
     * Trigger all those greats functions
     */
    getAllData(function() {
        getVoteData(function() {
            prepateTemplates();
        })
    })
})
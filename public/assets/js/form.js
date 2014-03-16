var convertFormToJSON = function(form){
    var array = $(form).serializeArray();
    var json = {};

    $.each(array, function() {
        json[this.name] = this.value || '';
    });

    return json;
};

var postToServer = function(sendData, callback){
    if (localStorage['user'] && appData.auth) {
        var token = appData.authToken,
            user = JSON.parse( localStorage.getItem('user')),
            login = user.login,
            $spinner = $('.spinner');

        //Preparing senging data
        var cat = sendData.category;

        var postData = {
            url: sendData.url,
            title: sendData.title
        };

        var checkEmpty = function(field){
            if(sendData[field].length !== 0) {postData[field] = sendData[field]}
        };
        var checkEmptyArr = ['author', 'author-mail', 'author-link', 'tags'];
        for (var i = 0; i < checkEmptyArr.length ; i++) {
            checkEmpty(checkEmptyArr[i]);
        }

        var data = {
            token: token,
            postData: postData,
            login: login,
            cat: cat,
            lang: sendData.lang
        };

        if (devMode) { console.log('ready to send ',data); }

        //TODO: change to post
        $.ajax({
            type: 'get',
            url: '/post-article',
            data: data,
            beforeSend: function() {
                $spinner.show();
            },
            complete: function(){
                $spinner.hide();
            },
            success: function(data) {
                callback(data);
            },
            error: function(err) {
                if (devMode) { console.log(err); }

                $('#addNewUrlForm').find('.form-errors').html( appData.records.formDisabled ).show();
            }
        });
    }
};

var addNewArticleRecall; //recalling for after login
var addNewArticle = function( p ) {
    var $form = $('#addNewUrlForm'),
        $selectCategory = $('#category'),
        tempSelects = '',
        tempTagsObj = {},
        tempTags = [],
        _this = $('a[href=addNewUrl]'),
        url = (p && p.url) || '',
        title =  (p && p.title) || '',
        author =  (p && p.author) || '',
        $tagsInput
        ;

    $('#url').val(url);
    $('#title').val(title);
    $('#author').val(author);

    //if user not authorized
    if ( !window.appData.auth ) {
        addNewArticleRecall = p || true;
        showModal('login-popup');
        return false
    } else {
        addNewArticleRecall = false;
        showModal('addNewUrlModal');
    }

    //prevent double init
    if ( $(_this).hasClass('js-already-init') ) return false;

    //Waiting till all data comes
    $.when(getAllDataDeffered.promise()).then(function(){

        //load all category and tags
        for (var category in totalTagList ) {
            if ( totalTagList.hasOwnProperty(category) ) {

                tempSelects += ('<option value="' + category + '">' + category + '</option>');

                var elem = totalTagList[category],
                    i = elem.length;

                while (i--) {
                    var arr = elem[i].tags,
                        j = arr.length;

                    while (j--) {
                        tempTagsObj[arr[j]] = true;
                    }

                }
            }
        }

        // filter
        for (var k in tempTagsObj) tempTags.push(k);

        $selectCategory
            .append(tempSelects)
            .on('change', function(){
                var selectVal = $(this).val();

                if (selectVal != "-1") {
                    $tagsInput.enable();
                } else {
                    $tagsInput.disable();
                }
            });

        /**
         * AutoSuggest for tags input
         * http://nicolasbize.github.io/magicsuggest/
        */

        $tagsInput = $('#tags').magicSuggest({
            resultAsString: true,
            width: 300,
            data: tempTags,
            disabled: true
        });

        $form.on('submit', function( e ){
            e.preventDefault();

            var sendData,
                tagsArray,
                errorField = $form.find('.form-errors'),
                successField = $form.find('.form-success'),
                validate = {
                    status: true,
                    errors: []
                };

            sendData = convertFormToJSON(this);

            var proceedToServer = function(){
                tagsArray = $tagsInput.getValue();
                sendData['tags'] = tagsArray;

                postToServer(sendData, function(data){
                    if (devMode) { console.log('send done', data); }

                    //if error
                    if (data.status) {
                        //show success message
                        successField.html(' <a href="'+  data.data.html_url +'">' +  appData.records.formSuccess +'</a>').show();

                        //reset form and input with tags
                        $tagsInput.disable();
                        $form[0].reset();
                        $tagsInput.clear(true);
                    } else {
                        var message = data.message || appData.records.formFailed;

                        validate.status = false;
                        validate.errors.push( message );

                        errorField.html( validate.errors.join('<br>')).show();
                    }

                })
            };


            //Check auth
            if (!appData.auth) {
                validate.status = false;
                validate.errors.push('Only authorized users can add articles.');
            } else {
                //checking unique title and existing url
                $.ajax({
                    url: '/validate',
                    data: {
                        url: sendData['url'],
                        title: sendData['title']
                    },
                    async: false,
                    success: function(data) {

                        //If validation passed, send data to server
                        if ( data.status ) {
                            errorField.hide();

                            proceedToServer();

                        } else {
                            var message = data.message || "Validation failed";

                            validate.status = false;
                            validate.errors.push( message );

                            errorField.html( validate.errors.join('<br>')).show();
                        }
                    },
                    error: function(err) {
                        if (devMode) { console.log(err); }

                        errorField.html( appData.records.formDisabled ).show();
                    }
                });
            }

            if ( !validate.status ) {
                errorField.html( validate.errors.join('<br>')).show();
                return false;
            }
        });

        $(_this).addClass('js-already-init');
    });

};

$(document).ready(function() {

    //Setting event listeners
    $('body')
        .on('click', 'a[href=addNewUrl]', function( e ){
            e.preventDefault();

			addNewArticle();
        })
        .on('click', '.js-popup-close', function(e){
            closeModal();
        });

	var title = getURLParameter('title'),
		author = getURLParameter('author'),
		url = getURLParameter('url');

    // Auto-open on title & url parameters was set
	if ( (title !== null) && (url !== null)) {
		addNewArticle({
			title: title,
			url: url,
			author: author
		})
	}
});

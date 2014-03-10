$(document).ready(function() {

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
                login = user.login;

            //Preparing senging data
            var cat = sendData.category,
                mainTag = sendData.mainTag;

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
                mainTag: mainTag,
                cat: cat
            };

//            console.log('ready to send ',data);

            //TODO: change to post
            $.ajax({
                type: 'get',
                url: '/post-article',
                data: data,
                success: function(data) {
                    callback(data);
                },
                error: function(error) { console.log(error); }
            });
        }
    };

    $('body')
        .on('click', 'a[href=addNewUrl]', function( e ){
            e.preventDefault();

            var $form = $('#addNewUrlForm'),
                $selectCategory = $('#category'),
                tempSelects = '',
                tempTags = []
                ;

            //if user not auth
            if ( !window.appData.auth ) {
                showModal('login-popup');
                return false
            }

            showModal('addNewUrlModal');

            //prevent double init
            if ( $(this).hasClass('js-already-init') ) return false;

            //load all category and tags
            for ( var cat in totalTagList ) {
                if ( totalTagList.hasOwnProperty(cat) ){

                    tempSelects += ('<option value="' + cat + '">' + cat + '</option>');

                    for ( var tag in totalTagList[cat] ) {
                        tempTags.push(tag);
                    }
                }
            }

            $selectCategory.append(tempSelects);

            /**
             * AutoSuggest for tags input
             * http://nicolasbize.github.io/magicsuggest/
            */

            var $tagsInput = $('#tags').magicSuggest({
                resultAsString: true,
                width: 300,
                data: tempTags
            });

            $form.on('submit', function( e ){
                e.preventDefault();

                var sendData,
                    tagsArray,
                    errorField = $form.find('.form-errors'),
                    validate = {
                        status: true,
                        errors: []
                    };

                sendData = convertFormToJSON(this);

                var proceedToServer = function(){
                    tagsArray = $tagsInput.getValue();
                    sendData['mainTag'] = tagsArray.shift();
                    sendData['tags'] = tagsArray;

                    postToServer(sendData, function(data){
                        //TODO: push message to UI and clean form
                        console.log('send done', data);
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

                                proceedToServer();

                            } else {
                                var message = data.message || "Validation failed";

                                validate.status = false;
                                validate.errors.push( message );
                            }
                        },
                        error: function( data ) {
                            console.log( 'Validation service is not responding.' );
                        }
                    });

                    if ( !validate.status ) {
                        errorField.html( validate.errors.join('<br>'));
                        return false;
                    }
                }

            });

            $(this).addClass('js-already-init');
        })
        .on('click', '.js-popup-close', function(e){
            closeModal();
        });

});

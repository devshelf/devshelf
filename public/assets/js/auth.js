var auth = function() {
    var popup = open('/auth/stub', 'popup', 'width=1015,height=500');
};

var drawLogined = function(userData) {
    templateEngine.insertTemplate( {
        template: 'menu-logined',
        params: {
            username: userData.name
        },
        target: 'user-login'
    });
};

var authCallback  = function(userData) {

    closeModal();

    drawLogined(userData);

    appData.auth = true;
    localStorage.setItem('user', JSON.stringify(userData));

    if(voteCache !== undefined) {
        sendVote(voteCache); //running cached voting
    }

    if(typeof addNewArticleRecall) {
        addNewArticle(addNewArticleRecall); //running cached form call
    }
};

var drawLoginButton = function(){
    templateEngine.insertTemplate( {
        template: 'menu-not-logined',
        target: 'user-login'
    });
};

var checkAuth = function(){
    if(localStorage['user'] && appData.auth) {
        var user = JSON.parse( localStorage.getItem('user') );

        drawLogined(user);

    } else {
        drawLoginButton();
    }
};

var unAuth = function(){
    appData.auth = false;
    localStorage.removeItem('user');
    drawLoginButton();

    $('.auth-iframe').remove();
    $('body').append('<iframe src="/logout" class="auth-iframe"></iframe>');
};

$(function(){
    $('body')
        .on('click', '.js-login', function(e){
            e.preventDefault();
            auth();
        })
        .on('click', '.js-logout', function(e){
            e.preventDefault();
            unAuth();
        })
        .on('click', '.js-popup-close', function(e){
            e.preventDefault();
            closeModal();
        });
});
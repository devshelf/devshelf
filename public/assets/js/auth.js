var auth = function() {
    var popup = open('/auth/github', 'popup', 'width=1015,height=500');
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
//    console.log(userData);

    $("#login-popup").trigger("hide");
    drawLogined(userData);

    localStorage.setItem('user', JSON.stringify(userData));

    if(voteCache !== undefined) {
        sendVote(voteCache); //running cached voting
    }
};

var drawLoginButton = function(){
    templateEngine.insertTemplate( {
        template: 'menu-not-logined',
        target: 'user-login'
    });
};

var checkAuth = function(){
    if(localStorage['user']) {
        var user = JSON.parse( localStorage.getItem('user') );

        drawLogined(user);

        $.ajax({
            url: '/auth/check',
            success:function( authorized ) {

                if (authorized === 'false') {
                    $('.auth-iframe').remove();
                    $('body').append('<iframe src="/auth/github" class="auth-iframe"></iframe>')
                }
            }
        });

    } else {
        drawLoginButton();
    }
};

var unAuth = function(){
    localStorage.removeItem('user');

    $.ajax({
        url: '/auth/check',
        success:function( authorized) {
            if (authorized === 'true') {
                $('.auth-iframe').remove();
                $('body').append('<iframe src="/logout" class="auth-iframe"></iframe>')

                drawLoginButton();
            }
        }
    });
};

$(function(){
    $('body').on('click', '.js-login', function(e){
        e.preventDefault();

        auth();
    });

    $('body').on('click', '.js-logout', function(e){
        e.preventDefault();

        unAuth();
    });

    $('body').on('click', '.js-login-popup-close', function(e){
        $("#login-popup").trigger("hide");
    });
});
var voteCache; //caching vote before login

var sendVote = function(that){
    var t = $(that),
        voteType = t.data('vote-type'),
        id = t.parents('.js-vote-item').data('id');

    var data = {
        _id: id
    };

    var url = '/'+voteType+'Votes';

    $.ajax({
        url: url,
        data: data,
        success:function( data ) {
            if (data === 'unauthorized') {

                $("#login-popup").simpleModal().trigger( "show" );

                voteCache = that;
            } else if (data === 'incorrect ID') {
                console.log('incorrect ID');
            } else {
                getVotes(that);
            }
        }
    });
};

var getVotes = function(that) {
    var t = $(that),
        voteItem = t.parents('.js-vote-item'),
        id = voteItem.data('id');

    var data = {
        _id: id
    };

    $.ajax({
        url: '/getVotes',
        data: data,
        success:function( data ) {

            if (data !== null) {
                voteItem.find('.js-vote-result').text(data.plusVotes - data.minusVotes);
            }
        }
    });
};

$(function(){

    //Listeners
    $('body').on('click', '.js-vote', function(e){
        e.preventDefault();

        sendVote(this);
    });

});
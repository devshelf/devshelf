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

                showModal('login-popup');

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
                var result = voteItem.find('.js-vote-result'),
                    newVotes = data.plusVotes - data.minusVotes;

                if (Math.abs(parseInt(result.html())) <= 2) {
                    result.removeClass('neutral positive negative');
                    if (newVotes === 0) {
                        result.addClass('neutral');
                    } else if (newVotes > 0) {
                        result.addClass('positive');
                    } else {
                        result.addClass('negative');
                    }
                }
                result.text(newVotes);
            }
        }
    });
};

$(function(){

    //Listeners

    if (appData.commonOpts.voting.enabled) {
        $('body').on('click', '.js-vote', function(e){
            e.preventDefault();

            sendVote(this);
        });
    }

});
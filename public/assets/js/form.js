$(document).ready(function() {
    var token = "";
    var login = "jurispukitis";
    var repo = "devshelf";

    var testObject = {
        "url": "1test_http://www.w3.org/blog/CSS/2012/06/14/unprefix-webkit-device-pixel-ratio/",
        "title": "test_How to unprefix -webkit-device-pixel-ratio",
        "author": "test_W3C",
        "tags": [
            "test_best-practices",
            "test_media-queries",
            "test_responsive"
        ]
    };

    var userData = {
        token: token,
        login: login,
        repo: repo
    };


    $('#btn').click(function() {
        $.ajax({
            type: 'GET',
            url: 'https://api.github.com/user?access_token='+token,
            crossDomain: true,
            success: function(data) { console.log(data); },
            error: function(error) { console.log(error); }
        });

    });

    $('#fork').click(function() {
        $.ajax({
            type: 'post',
            url: 'https://api.github.com/repos/sourcejs/devshelf/forks?access_token='+token,
            crossDomain: true,
            success: function(data) { console.log(data); },
            error: function(error) { console.log(error); }
        });
    });

    $('#commit').click(function() {
        var articleFile = {};

        $.ajax({
            type: 'get',
            url: 'https://api.github.com/repos/sourcejs/devshelf/contents/article_data/css.json?access_token='+token,
            crossDomain: true,
            success: function(data) {
                articleFile = data;
                sendToServer();
            },
            error: function(error) { console.log(error); }
        });

        function sendToServer() {
            var allDataForServer = {
                testArticle: testObject,
                userData: userData,
                fileFromRepo: articleFile
            };
            allDataForServer = JSON.stringify(allDataForServer);
            $.ajax({
                type: 'POST',
                url: '/post',
                data: allDataForServer
            });
            $.get("/get", function(file) {
                postToGitHub(file);
            });

            function postToGitHub(file) {
                var sha = "";
                $.ajax({
                    type: 'get',
                    url: 'https://api.github.com/repos/jurispukitis/devshelf/contents/article_data/css.json',
                    success: function(data) {
                        sha = data["sha"];
                        sendToGitHub()
                    },
                    error: function(error) { console.log(error); }
                });

                function sendToGitHub() {
                    var datas = JSON.stringify({"message":"New content123","sha":sha,"content": file}, false, 4);
                    $.ajax({
                        type: 'PUT',
                        url: 'https://api.github.com/repos/jurispukitis/devshelf/contents/article_data/css.json?access_token='+token,
                        data: datas,
                        success: function(data) {
//                            pullRequest();
                            console.log(data)
                            ; },
                        error: function(error) { console.log(error); }
                    });
                }

                function pullRequest() {
                    var requestData = JSON.stringify({
                        "sha": "6d6bf7961b8f88d6e7d11cf8d281bae10d1e76d1"
                    }, false, 4);

                    $.ajax({
                        type: 'POST',
                        url: 'https://api.github.com/repos/sourcejs/devshelf/pulls?access_token='+token,
                        data: requestData,
                        success: function(data) {console.log(data)},
                        error: function(error) { console.log(error); }
                    });
                }
            }
        }
    });

});

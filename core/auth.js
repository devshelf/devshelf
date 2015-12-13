var everyauth = require('everyauth');

//everyauth.debug = true;

var usersById = {},
    usersByGhId = {},
    nextUserId = 0;

var addUser = function (source, sourceUser, token) {
    var user;
    sourceUser.token = token; //extending object with access_token

    if (arguments.length === 1) { // password-based
        user = sourceUser = source;
        user.id = ++nextUserId;
        return usersById[nextUserId] = user;
    } else { // non-password-based
        user = usersById[++nextUserId] = {id: nextUserId};
        user[source] = sourceUser;
    }
    return user;
};

var GHappID = global.MODE === 'production' ? global.opts.github.appID : global.opts.github.devAppID;
var GHappSecret =  global.MODE === 'production' ? global.opts.github.appSecret : global.opts.github.devAppSecret;

everyauth.everymodule
  .findUserById( function (id, callback) {
    callback(null, usersById[id]);
  });

everyauth.github
    .appId(GHappID)
    .appSecret(GHappSecret)
    .scope('public_repo')
    .findOrCreateUser( function (sess, accessToken, accessTokenExtra, ghUser) {
        return usersByGhId[ghUser.id] || (usersByGhId[ghUser.id] = addUser('github', ghUser, accessToken));
        })
    .redirectPath('/auth/done');

// Overriding logout
everyauth.everymodule.handleLogout( function (req, res) {
    delete req.session.authCache;

    req.logout();

    this.redirect(res, this.logoutRedirectPath());
});
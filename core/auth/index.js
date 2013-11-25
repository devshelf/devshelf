var everyauth = require('everyauth');

//everyauth.debug = true;

var usersById = {},
    usersByGhId = {},
    nextUserId = 0;

var addUser = function (source, sourceUser) {
  var user;
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

var GHappID = MODE === 'development' ? opts.github.devAppID : opts.github.appID,
    GHappSecret =  MODE === 'development' ? opts.github.devAppSecret : opts.github.appSecret;

everyauth.everymodule
  .findUserById( function (id, callback) {
    callback(null, usersById[id]);
  });

everyauth.github
  .appId(GHappID)
  .appSecret(GHappSecret)
  .findOrCreateUser( function (sess, accessToken, accessTokenExtra, ghUser) {
      return usersByGhId[ghUser.id] || (usersByGhId[ghUser.id] = addUser('github', ghUser));
  })
  .redirectPath('/auth/done');
var deepExtend = require('deep-extend');
var requireUncached = function (module) {
    delete require.cache[require.resolve(module)];
    return require(module);
};

var coreSettings = requireUncached('./default-options');
deepExtend(coreSettings, requireUncached('./common-options'));

// If secure options exists, merge those on top of our default settings
try {
    deepExtend(coreSettings, requireUncached('./secure-options'));
} catch(e) {}

module.exports = coreSettings;
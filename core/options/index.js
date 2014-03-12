var coreSettings = require("./options.json"),
    deepExtend = require('deep-extend'),
    fs = require('fs');

var secureOptions = {},
    secureOptionsFile = "/secure-options.json",
    commonSettingsWithFrontendFile = "/common-options.json";

var commonSettingsWithFrontend = require(__dirname + commonSettingsWithFrontendFile);
deepExtend(coreSettings, commonSettingsWithFrontend);

if(fs.existsSync(__dirname + secureOptionsFile)) {

    secureOptions = require(__dirname + secureOptionsFile);
    deepExtend(coreSettings, secureOptions);
}
module.exports = coreSettings;
var coreSettings = require("./options"),
    deepExtend = require('deep-extend'),
    fs = require('fs');

var secureOptions = {},
    secureOptionsFile = "/secure-options",
    commonSettingsWithFrontendFile = "/common-options";

var commonSettingsWithFrontend = require(__dirname + commonSettingsWithFrontendFile);
deepExtend(coreSettings, commonSettingsWithFrontend);

if(fs.existsSync(__dirname + secureOptionsFile)) {
    secureOptions = require(__dirname + secureOptionsFile);
    deepExtend(coreSettings, secureOptions);
}
module.exports = coreSettings;
var coreSettings = require("./options.json"),
    deepExtend = require('deep-extend'),
    fs = require('fs');

var secureOptions = {},
    secureOptionsFile = "/secure-options.json";
    commonSettingsWithFrontendFile = "/common-options.json";

if(fs.existsSync(__dirname + secureOptionsFile)) {
    commonSettingsWithFrontend = require(__dirname + commonSettingsWithFrontendFile);
    deepExtend(coreSettings, commonSettingsWithFrontend);

    secureOptions = require(__dirname + secureOptionsFile);
    deepExtend(coreSettings, secureOptions);
}

module.exports = coreSettings;
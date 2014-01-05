var coreSettings = require("./options.json"),
    deepExtend = require('deep-extend'),
    fs = require('fs');

var extendedSettings = {},
    extendedSettingsFile = "/secure-options.json";

if(fs.existsSync(__dirname + extendedSettingsFile)) {
    extendedSettings = require(__dirname + extendedSettingsFile);

    deepExtend(coreSettings, extendedSettings);
}

module.exports = coreSettings;
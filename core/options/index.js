var deepExtend = require('deep-extend'),
    JSON5 = require('json5'),
    fs = require('fs');

var coreSettings = JSON5.parse(fs.readFileSync(__dirname + '/options.json5', "utf8")),

    secureOptionsFile = "/secure-options.json", //TODO: change to JSON5, after realising l18n DevShelf
    commonSettingsWithFrontendFile = "/common-options.json5";

var commonSettingsWithFrontend = JSON5.parse(fs.readFileSync(__dirname + commonSettingsWithFrontendFile, "utf8"));
deepExtend(coreSettings, commonSettingsWithFrontend);

if(fs.existsSync(__dirname + secureOptionsFile)) {

    var secureOptions = JSON5.parse(fs.readFileSync(__dirname + secureOptionsFile, "utf8"));
    deepExtend(coreSettings, secureOptions);

}
module.exports = coreSettings;
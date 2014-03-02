var geoip = require('geoip-native');

module.exports = function (req, res, next) {

    if (!req.cookies.lang && req.method == 'GET') {

        var
            opts =  global.opts.l18n,
            geodata = geoip.lookup('82.200.164.226'),
            countryCode = geodata.code,
            lang;

        console.log(geodata);

        /**
         * Recieve main lang abbr from lag subset
         *
         * @param code {String}    code we're looking for
         * @param obj {Object}     set language families
         * @returns {String}       lang code
         */
        function getCommonLang(code, obj) {
            code = code.toLowerCase();

            for (k in obj) {
                var el = obj[k];

                if ({}.toString.call(el) == '[object Array]') {
                    if (~el.indexOf(code)) return k;
                }

                if ({}.toString.call(el) == '[object Object]') {
                    return getCommonLang(code, el);
                }
            }

            return opts.defaultLang;
        }

        // setting language on first enter
        lang = req.session.lang = getCommonLang(countryCode, opts.langZone);

        res.cookie('country', countryCode, { maxAge: 3600000, httpOnly: false });
        res.cookie('lang', lang, { maxAge: 3600000, httpOnly: false });
    }

    next();
}
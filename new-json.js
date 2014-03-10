var fs = require('fs');

var filesArr = ['css','js','html','other'];

filesArr.map(function(file){
    var output = {};

    output[file] = [];

    var currentFile = JSON.parse(fs.readFileSync(__dirname + '/articles-data/'+file+'.json', "utf8"));


    for (var tag in currentFile) {
        var currentObj = currentFile[tag];

        for (var i = 0; i < currentObj.length; i++) {
            if (typeof currentObj[i].tags === 'object') {
                currentObj[i].tags.unshift(tag);
            } else {
                currentObj[i].tags = [];

                currentObj[i].tags.unshift(tag);
            }

            delete currentObj[i]['id'];

            output[file].push(currentObj[i]);
        }

    }

    fs.writeFile(__dirname + '/articles-data/'+file+'.new.json', JSON.stringify(output, null, 4), function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log(file + " done");
        }
    });

});
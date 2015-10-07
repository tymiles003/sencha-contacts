var https = require('https')
    , http = require('http')
	, querystring = require('querystring')
    , url = require('url')
    , _ = require('underscore')._
    , fs = require('fs')
    , host = 'wiki.xxx.com'
    , pagePath = '/plugins/viewstorage/viewpagestorage.action?pageId='
    , params

    , modelFields = require('./modelFields.js')

    , wikiLogin =  'contacts.xxx.com'
    , wikiPassword = 'xxxxxxxxx';

var fotoPath = 'https://wiki.ringcentral.com/download/thumbnails/xxxx';

var pathes = [

];

function createRequestOptions(page) {
    return {
        host: host, port: 443, path: page, headers: {
            'Authorization': 'Basic ' + new Buffer(wikiLogin + ':' + wikiPassword).toString('base64')
        }
    };
}
function getData(callback) {
    var options = createRequestOptions(pagePath + spbPath);

    var request = https.get(options, function (res) {
        var body = "";
        res.on('data', function (data) {
            body += data;
        });
        res.on('end', function () {
            callback(null, body);
        })
        res.on('error', function (e) {
            callback(e, null);
        });
    });
}

var regExp = '<td[\\s\\S]*?>([\\s\\S]*?)<\\/td>';
var personRegExp = new RegExp(regExp, 'gm');
var fieldRegExp = new RegExp(regExp, 'm');
var emailRegExp = new RegExp('<a[\\s\\S]*?>([\\s\\S]*?)<\\/a>');
var fotoRegExp = new RegExp('filename="([\\s\\S]*?)"');

function getField(personRecord, index, keepTags) {
    var fieldRaw = personRecord[index]
        , field = null;

    if (fieldRaw) {
        field = fieldRaw.match(fieldRegExp);
        if (field) {
            field = field[1] || "";
            field = field.replace("&nbsp;", "").trim();
            if (!keepTags) {
                field = field.replace(/<\/?[^>]+(>|$)/g, "");
            }
        }
        else{
            console.log("No field found: " + fieldRaw);
        }
    } else {

    }

    return field;
}

function parseRecord(tr) {
    var personRecord = tr.match(personRegExp),
        result = null;

    if (personRecord) {
        var emailParsed
            ,emailRaw = getField(personRecord, 7, true);

        if (emailRaw) {
            emailParsed = emailRaw.match(emailRegExp);
            emailParsed = emailParsed && emailParsed[1] || "";
        }

        var fotoParsed
            , fotoRaw = getField(personRecord, 1, true);
        if (fotoRaw) {
            fotoParsed = fotoRaw.match(fotoRegExp);
            fotoParsed = fotoParsed && fotoParsed[1] || "";
        }

        result = {
            'ID': getField(personRecord, 0)
            , 'Foto': fotoParsed
            , 'Name': getField(personRecord, 2)
            , 'Title': getField(personRecord, 3)
            , 'Dept': getField(personRecord, 4)
            , 'Group': getField(personRecord, 5)
            , 'Manager': getField(personRecord, 6)
            , 'Email': emailParsed
            , 'Phone': getField(personRecord, 8)
            , 'Skype': getField(personRecord, 11)
            , 'Birthday': getField(personRecord, 12)
            , 'OtherContacts': getField(personRecord, 13)
        };
    }
    else{
    }

    return result;
};

function downloadFoto(fileName){
    var url = fotoPath + encodeURI(fileName)
        , options = createRequestOptions(url)
        , fsFileName = '../foto/' + fileName;

    fs.exists(fsFileName, function (exists) {
        if (!exists) {
            var file = fs.createWriteStream(fsFileName);
            https.get(options, function (response) {
                response.pipe(file);
            });
        }
    });
}

function parseSpbData(data){
    var regExp = /<h1>(.*?)<\/h1>[\s\S]*?<table>([\s\S]*)<\/table>/g
    var found = regExp.exec(data);

    var title
        , table
        , trs
        , recordsParsed = [];

    title = found && found[1] || "[no title]";
    table = found && found[2];

    if (table) {
        trs = table && table.match(/<tr>([\s\S]*?)<\/tr>/g);
        _.each(trs, function (recordRaw) {
            var recordParsed = parseRecord(recordRaw);
            if (recordParsed) {
                recordsParsed.push(recordParsed);

                if (recordParsed['Foto']){
                    downloadFoto(recordParsed['Foto']);
                }
            }
        });
    } else {
    }

    adoptSpbData(modelFields, recordsParsed);

    return recordsParsed;
}

function adoptSpbData(modelFields, recordsParsed) {
    for (var i = 0; i < recordsParsed.length; i++) {
        var record = recordsParsed[i]
            , value
            , name;

        _.each(modelFields, function (field) {
            if (_.isString(field)) {
                name = field;
                value = record[field];
            }
            else {
                name = field.name;
                value = record[name];
                value = field.convert.apply(record, [value, record]);
            }
            if (name) {
                if (value) {
                    record[name] = value;
                }
                else{
                    delete record[name];
                }
            }
        });
    }
}


function sendResult(response){
    function getErrorResponse(e){
        console.log("Uncaught exception: ")
        console.log(e);

        return {
            error: e.message
            , result: []
        }
    }

    function processData(err, content) {
        try {
            var jsonResponse = {};
            if (err) {
                jsonResponse = getErrorResponse(err);
            } else {
                jsonResponse = {
                    data: parseSpbData(content)
                }
            }

            jsonResponse.time = (new Date()).getTime();
        } catch (e) {
            jsonResponse = getErrorResponse(e);
        }

        var responseText = JSON.stringify(jsonResponse);

        if (response) {
            response.writeHead(200, {"Content-Type": "application/json"});
            response.end(responseText);
        } else {
            console.log(responseText);
        }
    }

    getData(processData);
}

var debugToConsole = false;

if (debugToConsole) {
    sendResult(null);
}
else{
     var server = http.createServer(function (request, response) {
         var body = '';
         response.setHeader('Access-Control-Allow-Origin', '*');

         request.on('data', function (data) {
             body += data;
         });

         request.on('end', function () {
             params = querystring.parse(body);
             sendResult(response);
         });
     });

     // Listen on port 8000, IP defaults to 127.0.0.1
     var serverPort = 8000;
     server.listen(serverPort);

     // Put a friendly message on the terminal
     console.log("Server running at http://127.0.0.1:" + serverPort + "/");
}

var http = require('http');
var mongoose = require('mongoose');
var queryString = require('querystring');
var Track = mongoose.model('Track');
var Mistrack = mongoose.model('Mistrack');
var config = require('../../config/config');


exports.create = function (req, res) {
    var track = new Track(req.body);
    // Build the post string from an object

    track.save(function (err) {
        if (err) {
            var mistrack = new Mistrack(req.body);
            mistrack.save(function (error) {
                if (error) {
                    console.log('wired mistrack save error:' + error.message);
                }
            });
            return res.send(201, {message: err.message});
        } else {
            upload(track);
            return res.send(201, {message: 'success'});
        }
    });
}

var upload = function (track) {

    track.headers.time = Date.now();

    var mixFormat = track.data.toObject();
    for (var key in track.headers.toObject()) {
//        console.log(key);
        mixFormat.properties[key] = track.headers[key];
    }

    var data = queryString.stringify({
        data: new Buffer(JSON.stringify(mixFormat)).toString('base64'),
        api_key: config.api_key
    });

    var options = config.mixpanel;
    options.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': data.length
    }

// Set up the request
    var req2 = http.request(options, function (res2) {
        res2.setEncoding('utf8');
        res2.on('data', function (chunk) {
            console.log('ready to save,%s', JSON.stringify(mixFormat));
            track.sync = (chunk.toString().trim() == '1');
            console.log('upload: ' + track.sync);
            if (track.sync) {
                track.save(function (err) {
                    if (err) {
                        console.log('track save error:' + error.message);
                    }
                });
            }
        });
        res2.on('error', function (e) {
            console.log(e.message + "---" + JSON.stringify(mixFormat));
        })
    });
    req2.on('error', function (e) {
        console.log(e.message + "---" + JSON.stringify(mixFormat));
    })

// request the data
    req2.write(data);
    req2.end();
}

exports.upload = upload;
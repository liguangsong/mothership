var http = require('http');
var mongoose = require('mongoose');
var queryString = require('querystring');
var UptrackModel = mongoose.model('Uptrack');
var config = require('../../config/config');


//exports.create = function (req, res) {
//    var track = new Track(req.body);
//    // Build the post string from an object
//
//    track.save(function (err) {
//        if (err) {
//            var mistrack = new Mistrack(req.body);
//            mistrack.save(function (error) {
//                if (error) {
//                    console.log('wired mistrack save error:' + error.message);
//                }
//            });
//            return res.send(201, {message: err.message});
//        } else {
//            upload(track);
//            return res.send(201, {message: 'success'});
//        }
//    });
//}

var upload = function (track) {
//    console.log(JSON.stringify(track));
    var mixFormat = new Object();
    if (typeof track.data['properties'] == 'undefined')
        mixFormat['properties'] = new Object();
    for (var key in track.data.toObject()) {
        mixFormat[key] = track.data[key];
    }

    for (var key in track.headers.toObject()) {
        if (key === 'time') {
            mixFormat['properties'][key] = Math.round(track.headers[key].getTime() / 1000);
        } else {
            mixFormat['properties'][key] = track.headers[key];
        }
    }
//    console.log(JSON.stringify(mixFormat));

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
    var req = http.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('ready to save,%s', JSON.stringify(mixFormat));
//            console.log(chunk.toString());
            track.sync = (chunk.toString().trim() == '1');
            console.log('upload success? ' + track.sync);

            if (track.sync) {
                track.save(function (err) {
                    if (err) {
                        console.log('track save error after sync:' + err.message);
                    }
                });


//                console.log(JSON.stringify(track));
                var ut = {
                    headers: {},
                    data: {}
                }
                for (var key in track.data.toObject()) {
                    ut['data'][key] = track.data[key];
                }

                for (var key in track.headers.toObject()) {
                    if (key === 'time') {
                        ut['headers'][key] = track.headers[key].getTime();
                    } else {
                        ut['headers'][key] = track.headers[key];
                    }
                }
//                console.log(JSON.stringify(ut));
                var uptrack = new UptrackModel(ut);
                uptrack.save(function (err) {
                    if (err) {
                        console.log('uptrack save error after sync:' + err.message);
                    }
                });
            }
        });
        res.on('error', function (e) {
            console.log(e.message + "---" + JSON.stringify(mixFormat));
        })
    });
    req.on('error', function (e) {
        console.log(e.message + "---" + JSON.stringify(mixFormat));
    })

// request the data
    req.write(data);
    req.end();
}

exports.upload = upload;
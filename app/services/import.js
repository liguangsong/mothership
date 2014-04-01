var mongoose = require('mongoose');
var Track = mongoose.model('Track');
var schedule = require('node-schedule');
var tracks = require('../controllers/tracks');


exports.start = function () {
    schedule.scheduleJob('0 * * * *', function () {
        console.log('mixpanel upload start');
        Track.find({sync: false}, function (err, results) {
            if (err) {
                console.log('mongoose find error:' + JSON.stringify(err));
                return;
            }
            console.log('mixpanel pending upload:' + JSON.stringify(results));
            results.forEach(each);
        });
    });
};

var each = function (track) {
    if (track.validation === 'invalid') {
        return;
    }
    else if (track.validation === 'valid') {
        tracks.upload(track);
    } else {
        var ut = {
            headers: track.headers.toObject(),
            data: track.data.toObject()
        };
        var UptrackModel = mongoose.model('Uptrack');
//        console.log(JSON.stringify(ut));
        var uptrack = new UptrackModel(ut);
        uptrack.validate(function (err) {
            if (err) {
                track.validation = 'invalid';
                console.log('validation err:' + err.message);
            } else {
                track.validation = 'valid';
            }
            track.save(function (err) {
                if (err) {
                    console.log('track save error after validation:' + err.message);
                } else {
                    each(track);
                }
            });
        });
    }
}


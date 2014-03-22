var mongoose = require('mongoose');
var Track = mongoose.model('Track');
var schedule = require('node-schedule');
var tracks = require('../controllers/tracks');

var users = require('../controllers/users');
var fs = require('fs');
var file ='xiangmu.json';
var data;



exports.start = function () {
    schedule.scheduleJob('0 * * * *', function () {
        console.log('mixpanel upload start');
        Track.find({sync: false}, function (err, results) {
            if(err) {
                console.log('mongoose find error:' + JSON.stringify(err));
                return;
            }
            console.log('mixpanel pending upload:' + JSON.stringify(results));
            results.forEach(function(track) {
                tracks.upload(track, function (err) {
                    if (err) {
                        console.log(err.message + JSON.stringify(track));
                    }
                });
            });
        });
        var json = fs.readFile(file, 'utf8', function (err, data) {
            if (err) {
                console.log('Error: ' + err);
                return;
            }

            data = JSON.parse(data);
            data.forEach(function(json){
                users.createUser(json);
                /*User.find({"username":json.username},function (err, results) {
                 if(err) {
                 console.log('mongoose find error:' + JSON.stringify(err) +"the user is"+json.username);
                 return;
                 }
                 });*/
            });
        });
    });
};


'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AppSchema = new Schema({
    appId: {
        type: String,
        required: true,
        unique: true
    },
    version_code: {
        type: Number,
        required: true
    },
    name: String,
    package_name: String,
    url: String,
    download_url: String,
    description: String,
    home: String,
    local_folder: String,
    launchable: Number
}, {id: false});

AppSchema.static('findAppByAppId', function (appId, cb) {
    if (!cb) return new Error('No Callback Function Found');
    App.findOne({appId: appId}).exec(function (err, app) {
        if (err) cb(err, null);
        cb(null, app);
    })
});

var findAppByAppId = function (appId, cb) {
    if (!cb) return new Error('No Callback Function Found');
    App.findOne({appId: appId}).exec(function (err, app) {
        if (err) cb(err, null);
        cb(null, app);
    })
};

var App = mongoose.model('WebApp', AppSchema);

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../../config/config');

var UptrackSchema = new Schema({
    headers: {
        distinct_id: {
            type: String,
            required: true
        },
        ip: String,
        token: {
            type: String,
            required: true
        },
        time: {
            type: Date,
            required: true
        }
    },
    data: {
        event: {
            type: String,
            required: true
        },
        properties: {}
    }
});

UptrackSchema.path('headers.time').validate(function (time) {
    return ( typeof time != 'undefined' && time < Date.now());
}, 'time should cannot be future.');

mongoose.model('Uptrack', UptrackSchema);

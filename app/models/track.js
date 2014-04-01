var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../../config/config');

var TrackSchema = new Schema({
    sync: {
        type: Boolean,
        default: false
    },
    validation: {
        type: String,
        default: 'unvalidated' // 'invalid' 'valid'
    },
    headers: {
        distinct_id: String,
        ip: String,
        token: {
            type: String,
            default: config.token
        },
        time: Date
    },
    data: {
        event: String,
        properties: {}
    }
});

var Track = mongoose.model('Track', TrackSchema);

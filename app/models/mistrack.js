var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../../config/config');

var MistrackSchema = new Schema({
    headers: {
        distinct_id: String,
        ip: String,
        token: String,
        time: Date
    },
    data: {
        event: String,
        properties: {}
    }
});

mongoose.model('Mistrack', MistrackSchema);

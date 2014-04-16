'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LogSchema = new Schema({
    timestamp:  {
        type: Date
    },
    level:  {
        type: String
    },
    message:  {
        type: String
    }
});

mongoose.model('Log', LogSchema);

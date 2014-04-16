'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var UserDataSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    appId: {
        type: String,
        required: true
    },
    entityId: {
        type: String,
        required: true
    },
    data: {}
});

mongoose.model('Userdata', UserDataSchema);

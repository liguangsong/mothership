var winston = require('winston'),
    config = require('../../config/env/development');
require('winston-mongodb').MongoDB;

//Add a winston logger
winston.add(winston.transports.MongoDB, {"db":config.database, "collection":"logs"});

console.log = winston.info;
console.info = winston.info;
console.error = winston.error;
console.warn = winston.warn;
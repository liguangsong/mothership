'use strict';

var restify = require('express-restify-mongoose');
var mongoose = require('mongoose');

module.exports = function (app, passport, auth) {
    var options = {
        strict:true,
        prefix:'',
        version:''
//        middleware: [auth.requiresLogin]
    };

    var webapps = require('../app/controllers/webapps');
    var userdata = require('../app/controllers/userdatas');
    var rooms = require('../app/controllers/rooms');
    var medias = require('../app/controllers/medias');
    var tracks = require('../app/controllers/tracks');
    var schools = require('../app/controllers/schools');

    var UserModel = mongoose.model('User');
    var SchoolModel = mongoose.model('School');
    var UptrackModel = mongoose.model('Uptrack');
    var TrackModel = mongoose.model('Track');
    var RoomModel = mongoose.model('Room');
    var LogModel = mongoose.model('Log');

    app.get('/', function (req, res) {
        res.redirect('/webapp/login');
    });

    var users = require('../app/controllers/users');
    app.get('/signin', users.signin);
    app.get('/signup', users.signup);
    app.get('/signout', users.signout);

    restify.serve(app, UserModel, options);
    restify.serve(app, SchoolModel, options);
    restify.serve(app, UptrackModel, options);
    restify.serve(app, TrackModel, options);
    restify.serve(app, RoomModel, options);
    restify.serve(app, LogModel, options);

    //Setting up the users api
//    app.get('/users', users.all);
//    app.post('/users', users.create);
//    app.get('/users/:userId', users.show);



    app.get('/me', auth.requiresLogin, users.me);
    app.post('/users/:userId/password', auth.requiresLogin, users.password);
    app.post('/users/:userId/profile', auth.requiresLogin, users.profile);

    app.get('/userdata/:appId/:entityId', auth.requiresLogin, userdata.read);
    app.post('/userdata/:appId/:entityId', auth.requiresLogin, userdata.write);
    app.put('/userdata/:appId/:entityId', auth.requiresLogin, userdata.editFavorite);

    //route the rooms api
//    app.get('/rooms', auth.requiresLogin, rooms.all);
//    app.get('/rooms/:roomId', auth.requiresLogin, rooms.show);
//    app.post('/rooms', rooms.create);
    app.post('/rooms/:roomId/users', auth.requiresLogin, rooms.joinRoom);
    app.delete('/rooms/:roomId/users/:userId', auth.requiresLogin, rooms.exitRoom);
    app.post('/rooms/:roomId/apps', auth.requiresLogin, rooms.addApp);
    app.delete('/rooms/:roomId/apps/:appId', auth.requiresLogin, rooms.removeApp);

//    app.get('/schools', auth.requiresLogin, schools.all);
//    app.post('/schools',schools.create);

    app.get('/apps', webapps.all);
    app.get('/apps/:appId', auth.requiresLogin, webapps.show);
    app.get('/mirrors', auth.requiresLogin, webapps.mirrors);

    app.post('/upload', auth.requiresLogin, medias.create);
    app.get('/upload', auth.requiresLogin, medias.list);

//    app.post('/tracks', tracks.create);

    app.get('/dispatch', users.dispatch);

    //Setting the local strategy route
    app.post('/login', passport.authenticate('local'), function (req, res) {
        res.send(req.user);
    });

    //Finish with setting up the userId param
    app.param('userId', users.user);
    app.param('appId', webapps.app);
    app.param('roomId', rooms.room);

    //Home route
    var index = require('../app/controllers/index');
    app.get('/', index.render);

};

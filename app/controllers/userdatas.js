/**
 * ExerciseController
 */
var mongoose = require('mongoose');
var Userdata = mongoose.model('Userdata');

exports.read = function (req, res) {
    if (!req.user) return res.send(401);
    var username = req.user.username
        , appId = req.app.id
        , entityId = req.params.entityId;

    Userdata.findOne({
        userId: username,
        appId: appId,
        entityId: entityId
    }).exec(function (err, userdata) {
            if (err) {
                return res.send(500, err);
            }
            res.json(200, (userdata) ? userdata.data : {});
        })
};

exports.write = function (req, res) {
    if (!req.user) return res.send(401);

    var username = req.user.username
        , appId = req.app.id
        , entityId = req.params.entityId
        , data = req.body;

    Userdata.findOne({
        userId: username,
        appId: appId,
        entityId: entityId
    }).exec(function (err, userdata) {
            if (err) return res.send(500, err);
            if (userdata) {
                userdata.data = data;
            } else {
                userdata = new Userdata({
                    userId: username,
                    appId: appId,
                    entityId: entityId,
                    data: data
                });
            }
            userdata.save(function (err) {
                if (err) return res.send(500, err);
                res.json(200, userdata.data);
            });

        });
};

exports.editFavorite = function(req, res) {
    console.log('come in addFavorite');
    var username = req.user.username,
           appId = req.params.appId,
           entityId = req.params.entityId,
           data = req.body;
    Userdata.findOne({
        userId: username,
        appId: appId,
        entityId: entityId
    }).exec(function(err, userdata) {
        if(err) return res.send(500, err);
        console.log('got the mistake userdata');
        var updateData = userdata.data;
        var mistakes = updateData[data.cid][data.lid];
        if(mistakes) {
            console.log('got all the mistakes......................');
        }
        mistakes.forEach(function(item, index) {
            if(item.id == data.pid) {
                //data.action=='add'  
                if(data.action == 'add') {
                    //item.tag.concat(data.tags);  
                    item.tags = data.tags;
                    console.log('add--> item.tag='+JSON.stringify(item.tags));                    
                }
                //data.action == 'remove'
                if(data.action == 'remove') {
                    item.tags = data.tags;
                    console.log('remove-->item.tag='+JSON.stringify(item.tags));
/*                    data.tags.forEach(function(mtag, index) {
                        //TODO: splice the tag---absloutely delete
                        var tagIndex = item.tag.indexOf(mtag);
                        item.tag.splice(tagIndex, 1);
                    })*/
                }
            }
        })
        console.log('begin to update');
        userdata.update({'$set':{'data':updateData}}, function(err) {
            if(err) {
                console.log('update error');
                return res.send(500, err);
            }else{
                console.log('..............................................update success...............................please check database');
                res.json(200, userdata.data);
            }
        })
    })
}

exports.removeFavorite = function(req, res) {
    //remove 

}

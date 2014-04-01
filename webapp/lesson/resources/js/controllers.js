angular.module('SunLesson.controllers', [])
   .controller('RootCtrl', function($scope, $location, $rootScope, SandboxProvider, ids, lessonData, lessonUserdata, userInfo,me,DataProvider) {
        var rootSandbox = SandboxProvider.getSandbox();
        rootSandbox.initResource(ids, lessonData, lessonUserdata, userInfo,me);

       $rootScope.isBack = false;
       $scope.me = me;

       //Mixpanel
       initMixpanelWithSP(me._id,me.username,me.name,me.usergroup);
       LearningRelated.enterLesson(lessonData.id,lessonData.title);

       var tempActivityId = DataProvider.lessonUserdata.current_activity;
       if(!tempActivityId) {
            tempActivityId = DataProvider.lessonData.activities[0].id;
       }
       $location.path('/chapter/' + ids.cid +  '/layer/' + ids.layer_id + '/lesson/'+ids.lid+'/activity/'+tempActivityId);
    })

    .controller('ActivityCtrl', function($routeParams, $rootScope, SandboxProvider, ids, lessonData, lessonUserdata, userInfo, DataProvider) {  
        var activitySandbox = SandboxProvider.getSandbox();
        activitySandbox.initResource(ids, lessonData, lessonUserdata, userInfo);
        lessonUserdata.current_activity = $routeParams.aid;
    })

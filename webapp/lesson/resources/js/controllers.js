angular.module('SunLesson.controllers', [])
   .controller('RootCtrl', function($scope, $location, $rootScope, SandboxProvider, ids, lessonData, lessonUserdata, userInfo,me,DataProvider) {
        var rootSandbox = SandboxProvider.getSandbox();
        rootSandbox.initResource(ids, lessonData, lessonUserdata, userInfo,me);

       $rootScope.isBack = false;
       $scope.me = me;

       //Mixpanel
       initMixpanelWithSP(me._id,me.username,me.name,me.usergroup);
       LearningRelated.enterLesson(lessonData.id,lessonData.title);

       $location.path('/chapter/' + ids.cid + '/lesson/'+ids.lid+'/activity/'+ids.aid);
    })

    .controller('ActivityCtrl', function($routeParams, $rootScope, SandboxProvider, ids, lessonData, lessonUserdata, userInfo, DataProvider) {
        var activitySandbox = SandboxProvider.getSandbox();
        activitySandbox.initResource(ids, lessonData, lessonUserdata, userInfo);
        lessonUserdata.current_activity = $routeParams.aid;
    })

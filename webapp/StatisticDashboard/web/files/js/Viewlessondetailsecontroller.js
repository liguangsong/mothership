angular.module('static', []).controller('Viewlessondetailsecontroller', function ($scope, $http) {

    function GetRequest() {
        var url = location.search; //获取url中"?"符后的字串
        var theRequest = new Object();
        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            strs = str.split("&");
            for (var i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
            }
        }
        return theRequest;
    }

    var Request = new Object();
    Request = GetRequest();

    $http.get('/me')
        .success(function (data, status, headers, config) {
            $scope.user = data;
        }).error(function (data, status, headers, config) {
            $scope.status = "login failed";
            delete $scope.user;
            $scope.loggedin = false;
            console.log('not logged in');
        });
    var url = "/webapp/"+ "/" + Request["ChapterId"] + "/" + Request["LessonId"] + "/lesson.json";
    $http.get(url)
    //$http.get("/webapp/c844f495-4a66-4cd0-b03c-a7a3155e22db/3a661cb0-ff43-4f8a-aa0c-74ad47b507ff/lesson.json")
        .success(function (lessonData) {
            $scope.title = lessonData['title'];
            $scope.date = []
            var i, j = lessonData["activities"].length;
            for (i = 0; i < j; i++) {
                if (lessonData["activities"][i].type == "quiz") {
                    $scope.date.push(lessonData["activities"][i])
                }
            }
            $scope.quizs = $scope.date[0];
        }).error(function () {
            alert('getLessonMap Error');
        }
    )

    $scope.show_mistake_of_activity = function (id) {
        var i, j = $scope.date.length;
        for (i = 0; i < j; i++) {
            if ($scope.date[i].id == id) {
                $scope.quizs = $scope.date[i];
            }
        }
    }
})






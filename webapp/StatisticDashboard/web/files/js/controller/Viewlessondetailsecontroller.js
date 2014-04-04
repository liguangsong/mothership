angular.module('lesson-details', ['track.service'])
    .controller('Viewlessondetailsecontroller', function ($scope, $http, TracksDataProvider) {

        // 以下的两段代码是用来向数据源请求同一道题的两个数据，一是所有做过的人的数据（用户名、时间），另一个是所有做对的人的数据（用户名、时间）

        // 本题的错题率的算法是：
        // 1. 用做对的人的数据与所有做过的人的数据进行比较（时间维度），找出真正“第一次做对”的数据；
        // 2. 第一次做对的“人数”/所有做过的“人数” * 100%

        var finishThisProblemUsersJson;
        var finishThisProblemCorrectUsersJson;

        /**
        * [eg:]
        *
        * ProblemId = a34edb11-b7ec-4602-9e6c-27f68878fccb; Room = siba73, FinishProblem(做过这道题) 的全部详情
        *
        */

        // 是为了找到有多少人做过这道题，人数 = 第一次做的人数 = 错题率分母
        var finishProblemAll = {
            queryString:"$and=[{\"data.properties.UserName\":\"~siba73\"},{\"data.event\":\"FinishProblem\"},{\"data.properties.ProblemId\":\"a34edb11-b7ec-4602-9e6c-27f68878fccb\"}]&sort=data.properties.UserName"
        }
        var finishProblemAllUrl = TracksDataProvider.getUrl(finishProblemAll.queryString);

        $http.get(finishProblemAllUrl)
            .success(function (data) {
                finishThisProblemUsersJson = data;
                console.log("finishThisProblemUsersJson----------->"+JSON.stringify(data));
            }).error(function (error) {
                console.log("------>"+error);
            }).then(function(data){
               orderResultByUserName(finishThisProblemUsersJson);
            });

        var orderResultByUserName = function(data){
            var mapFinal = {};
            angular.forEach(data,function(userRecord){
                var username = userRecord.data.properties.UserName;
                if(mapFinal[username] == undefined){
                    mapFinal[username] = [];
                }
                mapFinal[username].push(userRecord);
            });
            console.log("final result----->"+JSON.stringify(mapFinal));
            return mapFinal;
        };




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
                $scope.data = []
                var i, j = lessonData["activities"].length;
                for (i = 0; i < j; i++) {
                    if (lessonData["activities"][i].type == "quiz") {
                        $scope.data.push(lessonData["activities"][i])
                    }
                }
                $scope.quizs = $scope.data[0];
            }).error(function () {
                alert('getLessonMap Error');
            }
        )

        $scope.show_mistake_of_activity = function (id) {
            var i, j = $scope.data.length;
            for (i = 0; i < j; i++) {
                if ($scope.data[i].id == id) {
                    $scope.quizs = $scope.data[i];
                }
            }
        }
    }
)






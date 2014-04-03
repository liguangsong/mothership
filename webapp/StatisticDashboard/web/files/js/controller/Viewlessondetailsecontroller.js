angular.module('lesson-details', ['mixpanel.service'])
    .controller('Viewlessondetailsecontroller', function ($scope, $http, MixpanelProvider) {

        // 以下的两段代码是用来向 mixpanel 请求同一道题的两个数据，一是所有做过的人的数据（用户名、时间），另一个是所有做对的人的数据（用户名、时间）

        // 本题的错题率的算法是：
        // 1. 用做对的人的数据与所有做过的人的数据进行比较（时间维度），找出真正“第一次做对”的数据；
        // 2. 第一次做对的“人数”/所有做过的“人数” * 100%

        var finishThisProblemUsersJson,finishThisProblemCorrectUsersJson;

        /**
         *
         * ProblemId = a34edb11-b7ec-4602-9e6c-27f68878fccb; Room = xw1303, FinishProblem(做过这道题) 的全部详情
         *
         */

        // 是为了找到有多少人做过这道题，人数 = 第一次做的人数 = 分母
        var finishProblemAll = {
            schema:"http://mixpanel.com/api/2.0/segmentation/",
            args:["limit=10000",
                "event=FinishProblem",
                "from_date=2014-01-14",
/*
                "unit=hour",
*/
                "to_date=2014-04-03",
                "on=properties[\"UserName\"]",
                "where=\"xw1303\" in properties[\"UserName\"] and \"a34edb11-b7ec-4602-9e6c-27f68878fccb\" == properties[\"ProblemId\"]",
                "type=general",
                "expire="+(new Date().getTime()+100000).toString(),
                "api_key="+MixpanelProvider.apiKey],
            api_secret:MixpanelProvider.apiSecret
        };

        var finishProblemAllUrl = MixpanelProvider.mixpanel(finishProblemAll.schema,finishProblemAll.args,finishProblemAll.api_secret)+'&callback=JSON_CALLBACK';

        /**
         *
         * ProblemId = a34edb11-b7ec-4602-9e6c-27f68878fccb; Room = xw1303, FinishProblemCorrect(做对这道题) 的全部详情
         *
         */
        var finishProblemCorrect = {
            schema:"https://data.mixpanel.com/api/2.0/export/",
            args:[/*"limit=10000",*/
/*
                "event=[\"FinishProblem\"]",
*/
                "from_date=2014-01-14",
                "to_date=2014-04-03",
/*
                "on=properties[\"$time\"]",
*/
/*
                "where=\"xw130315\" in properties[\"UserName\"] and \"a34edb11-b7ec-4602-9e6c-27f68878fccb\" == properties[\"ProblemId\"] and properties[\"CorrectOrNot\"]",
*/
/*
                "type=general",
*/
                "expire="+(new Date().getTime()+100000).toString(),
                "api_key="+MixpanelProvider.apiKey],
            api_secret:MixpanelProvider.apiSecret
        };

        var finishProblemCorrectUrl = MixpanelProvider.mixpanel(finishProblemCorrect.schema,finishProblemCorrect.args,finishProblemCorrect.api_secret)+'&callback=JSON_CALLBACK';

        /*var finishProblemAll = {
         schema:"https://data.mixpanel.com/api/2.0/export/",
         args:[
         "event=FinishProblem",
         "from_date=2014-01-14",
         "to_date=2014-04-03",
         "where=\"xw1303\" in properties[\"UserName\"] and \"a34edb11-b7ec-4602-9e6c-27f68878fccb\" == properties[\"ProblemId\"]",

         "expire="+(new Date().getTime()+100000).toString(),
         "api_key="+MixpanelProvider.apiKey],
         api_secret:MixpanelProvider.apiSecret
         };*/

        $http.jsonp(finishProblemAllUrl)
        .success(function (data) {
            finishThisProblemUsersJson = JSON.stringify(data);
            console.log("finishThisProblemUsersJson----------->"+finishThisProblemUsersJson);
        }).error(function (error) {
            console.log(error.message);
        }).then(function(data){
            $http.jsonp(finishProblemCorrectUrl)
            .success(function (data) {
                finishThisProblemCorrectUsersJson = JSON.stringify(data);
                console.log("finishThisProblemCorrectUsersJson----------->"+finishThisProblemCorrectUsersJson);
            }).error(function (error) {
                //console.log(error);
                alert("error");
            }).then(function(data){
                computeProblemCorrectRatiofunction(finishThisProblemUsersJson,finishThisProblemCorrectUsersJson);
            })
        });

        var computeProblemCorrectRatiofunction  = function(allData,correctData){

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






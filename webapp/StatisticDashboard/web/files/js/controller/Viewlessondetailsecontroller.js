angular.module('lesson-details', ['track.service'])
    .controller('Viewlessondetailsecontroller', function ($scope, $http, TracksDataProvider) {

        // 以下的两段代码是用来向数据源请求同一道题的两个数据，一是所有做过的人的数据（用户名、时间），另一个是所有做对的人的数据（用户名、时间）

        // 本题的错题率的算法是：
        // 1. 用做对的人的数据与所有做过的人的数据进行比较（时间维度），找出真正“第一次做对”的数据；
        // 2. 第一次做对的“人数”/所有做过的“人数” * 100%

        var finishThisProblemUsersJson;
        var finishThisProblemCorrectUsersJson;
        var peopleWhoDidThisProblem;
        var peopleWhoDidThisProblemCorrect;
        var peopleWhoDidThisProblemCorrectTheFirstTime = [];

        /**
        * [eg:]
        *
        * ProblemId = a34edb11-b7ec-4602-9e6c-27f68878fccb; Room = siba73, FinishProblem(做过这道题) 的全部详情
        *
        */

        var finishProblem = {
            // 是为了找到有多少人做过这道题，人数 = 第一次做的人数 = 错题率分母
            allQueryString:"$and=[{\"data.properties.UserName\":\"~siba73\"},{\"data.event\":\"FinishProblem\"},{\"data.properties.ProblemId\":\"a34edb11-b7ec-4602-9e6c-27f68878fccb\"}]&sort=data.properties.UserName",

            // 是为了找出多少人做对过这道题，需要注意的是，这个数字，并不是分子，而是分子的母集。因为可能有些学生并不是第一次作这道题就做对了
            // 所以，接下来我们要筛选出那些第一次做题的数据，依据的就是数据结构中的 time 这个 field。
            correctQueryString:"$and=[{\"data.properties.UserName\":\"~siba73\"},{\"data.event\":\"FinishProblem\"},{\"data.properties.ProblemId\":\"a34edb11-b7ec-4602-9e6c-27f68878fccb\"},{\"data.properties.CorrectOrNot\":true}]&sort=data.properties.UserName"
        };
        var finishProblemAllUrl = TracksDataProvider.getUrl(finishProblem.allQueryString);

        var finishProblemCorrectUrl = TracksDataProvider.getUrl(finishProblem.correctQueryString);

        var orderResultByUserName = function(data,type){
            var mapFinal = {};
            angular.forEach(data,function(userRecord){
                var username = userRecord.data.properties.UserName;
                if(mapFinal[username] == undefined){
                    mapFinal[username] = [];
                    mapFinal[username].push(userRecord);
                    mapFinal[username].first = new Date(userRecord.headers.time).getTime();
                    console.log("----------->FIRST=>"+type+" "+mapFinal[username].first);
                }else{
                    mapFinal[username].push(userRecord);
                    mapFinal[username].first = mapFinal[username].first < new Date(userRecord.headers.time).getTime()? mapFinal[username].first:new Date(userRecord.headers.time).getTime();
                    console.log("----------->FIRST=>"+type+" "+mapFinal[username].first);
                }
            });
            //console.log("final result----->"+JSON.stringify(mapFinal));
            return mapFinal;
        };

        $http.get(finishProblemAllUrl)
            .success(function (data) {
                finishThisProblemUsersJson = data;
                //console.log("finishThisProblemUsersJson----------->"+JSON.stringify(data));
            }).error(function (error) {
                console.log("------>"+error);
            }).then(function(data){
               peopleWhoDidThisProblem = orderResultByUserName(finishThisProblemUsersJson,"ALL");
               $scope.finishCount = Object.keys(peopleWhoDidThisProblem).length;
               console.log("---------------------->"+peopleWhoDidThisProblem);
            }).then(function(data){
                $http.get(finishProblemCorrectUrl)
                    .success(function (data) {
                        finishThisProblemCorrectUsersJson = data;
                        //console.log("finishThisProblemUsersJson----------->"+JSON.stringify(data));
                    }).error(function (error) {
                        console.log("------>"+error);
                    }).then(function(data){
                        peopleWhoDidThisProblemCorrect = orderResultByUserName(finishThisProblemCorrectUsersJson,"CORRECT");
                        $scope.finishCorrectCount = Object.keys(peopleWhoDidThisProblemCorrect).length;
                        for(var key in peopleWhoDidThisProblemCorrect){
                            if(peopleWhoDidThisProblem[key].first == peopleWhoDidThisProblemCorrect[key].first){
                                console.log("--------------->user: "+key+" ---------->time: "+peopleWhoDidThisProblem[key].first);
                                peopleWhoDidThisProblemCorrectTheFirstTime.push(key);
                            }
                        }
                    }).then(function(data){
                        $scope.finishCorrectTheFirstTimeCount = Object.keys(peopleWhoDidThisProblemCorrectTheFirstTime).length;
                        var exactRatio = $scope.finishCorrectTheFirstTimeCount/$scope.finishCount * 100;
                        $scope.correctRatio =  exactRatio.toString().substring(0,exactRatio.toString().indexOf(".")+3);
                    });
            });

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






angular.module('lesson-details', ['track.service','data.service'])
    .controller('Viewlessondetailsecontroller', function ($scope, $http, $q, TracksDataProvider, global, RouteUrl) {

        $scope.correctRatio = [];
        $scope.activitycorrectRatio={};
        var finishProblem
        var finishThisProblemUsersJson;
        var finishThisProblemCorrectUsersJson;
        var peopleWhoDidThisProblem;
        var peopleWhoDidThisProblemCorrect;
        var peopleWhoDidThisProblemCorrectTheFirstTime;
        var finishProblemAllUrl;
        var finishProblemCorrectUrl;
        var orderResultByUserName = function (data, type) {
            var mapFinal = {};
            angular.forEach(data, function (userRecord) {
                var username = userRecord.data.properties.UserName;
                if (mapFinal[username] == undefined) {
                    mapFinal[username] = [];
                    mapFinal[username].push(userRecord);
                    mapFinal[username].first = new Date(userRecord.headers.time).getTime();
//                        console.log("----------->FIRST=>"+type+" "+mapFinal[username].first);
                } else {
                    mapFinal[username].push(userRecord);
                    mapFinal[username].first = mapFinal[username].first < new Date(userRecord.headers.time).getTime() ? mapFinal[username].first : new Date(userRecord.headers.time).getTime();
//                        console.log("----------->FIRST=>"+type+" "+mapFinal[username].first);
                }
            });
            //console.log("final result----->"+JSON.stringify(mapFinal));
            return mapFinal;
        };

        global.get_user.then(function (data) {
            $scope.user = data;
        }, function (data) {
            console.log("no login");
        })

        RouteUrl.get_date.then(function (lessonData) {
            $scope.title = lessonData['title'];
            $scope.date = lessonData["data"]
            $scope.quizs = lessonData["data"][0];
            get_quiz_date();
            $('#lessonLoaderModal').modal('show');
            get_rate_of_all_wrong_question($scope.quizs["problems"]).then(function (data) {
                var i, j = data.length, sum = 0;
                for (i = 0; i < j; i++) {
                    sum = sum + data[i];
                }
                $scope.activitycorrectRatio[$scope.date[0].title]=sum/j;

                $('#lessonLoaderModal').modal('hide');
            }, function (err) {
                alert(err)
            })
        }, function () {
            alert('getLessonMap Error');
        })

        $scope.show_mistake_of_activity = function (id) {
//    $("#navigation a").each(function(){
//            if(this.id==id){
//                this.style.color='#ffffff'
//                this.style.backgroundColor="#1abc9c"
//            }else{
//                this.style.backgroundColor='';
//                this.style.color="#95a5a6"
//            }
//    }
//    )
            var i, j = $scope.date.length,title;
            for (i = 0; i < j; i++) {
                if ($scope.date[i].id == id) {
                    title=$scope.date[i].title;
                    $scope.quizs = $scope.date[i];
                    get_quiz_date();
                    $('#lessonLoaderModal').modal('show');
                       get_rate_of_all_wrong_question($scope.quizs["problems"]).then(function (data) {
                           var i, j = data.length, sum = 0;
                           for (i = 0; i < j; i++) {
                               sum = sum + data[i];
                           }
                           $scope.activitycorrectRatio[title]=sum/j;
                           $('#lessonLoaderModal').modal('hide');
                }, function (err) {
                    alert(err)
                })
                }
            }
        }

        $scope.showProblem = function (problem) {
            $scope.currentProblem = problem;
            $scope.colNum = problem.choices.length;
        }

        $scope.calcChoiceNum = function (index) {
            return String.fromCharCode(65 + index) + ".";
        };

        function get_quiz_date() {
            $scope.problems = [];
            var i, j = $scope.quizs.problems.length;
            for (i = 0; i < j; i++) {
                var get_quiz_body = getPbody($scope.quizs.problems[i]);
                $scope.problems.push({pbody: get_quiz_body['pbody'], imgbody: get_quiz_body['imgbody'], choices: $scope.quizs.problems[i]["choices"]})
            }
        }

        function getPbody(target) {
            var originBody = target.body;
            var tagIndex = originBody.indexOf("<ximage");
            if (tagIndex < 0) {
                var bodyString = originBody;
                var imageString = "";
            } else {
                bodyString = originBody.substring(0, tagIndex);
                var endIndex = originBody.indexOf("</ximage>", tagIndex);
                imageString = originBody.substring(tagIndex, (endIndex + "</ximage>".length + 1));
            }
            return {imgbody: imageString, pbody: bodyString}
        }

        function get_rate_of_all_wrong_question(date) {
            $scope.correctRatio=[];
            var i, j = date.length, all_problem_rate_of_activity = [];
            var defer = $q.defer();
            var promise = defer.promise;
            for (i = 0; i < j; i++) {
                var roomid = "~" + RouteUrl.get_roomId;
//              get_peopleWhoDidThisProblem(roomid, date[i].id)
                get_peopleWhoDidThisProblem("~siba73", "a34edb11-b7ec-4602-9e6c-27f68878fccb")
                    .then(get_exactRatio).then(function (data) {
                        $scope.correctRatio.push(data);
                        if ($scope.correctRatio.length == j - 1) {
                            defer.resolve($scope.correctRatio)
                        }
                    }, function (err) {
                        alert(err)
                    })
//
            }
            return promise
        }

        function get_peopleWhoDidThisProblem(roomid, problemid) {
            finishProblem = {
                // 是为了找到有多少人做过这道题，人数 = 第一次做的人数 = 错题率分母
                allQueryString: "$and=[{\"data.properties.UserName\":\"" + roomid + "\"},{\"data.event\":\"FinishProblem\"},{\"data.properties.ProblemId\":\"" + problemid + "\"}]&sort=data.properties.UserName",
                // 是为了找出多少人做对过这道题，需要注意的是，这个数字，并不是分子，而是分子的母集。因为可能有些学生并不是第一次作这道题就做对了
                // 所以，接下来我们要筛选出那些第一次做题的数据，依据的就是数据结构中的 time 这个 field。
                correctQueryString: "$and=[{\"data.properties.UserName\":\"" + roomid + "\"},{\"data.event\":\"FinishProblem\"},{\"data.properties.ProblemId\":\"" + problemid + "\"},{\"data.properties.CorrectOrNot\":true}]&sort=data.properties.UserName"
            };
            finishProblemAllUrl = TracksDataProvider.getUrl(finishProblem.allQueryString);
            var defer = $q.defer();
            var promise = defer.promise;
            $http.get(finishProblemAllUrl)
                .success(function (data) {
                    finishThisProblemUsersJson = data;
                    //console.log("finishThisProblemUsersJson----------->"+JSON.stringify(data));
                }).error(function (error) {
                    console.log("------>" + error);
                    defer.reject();
                }).then(function (data) {
                    peopleWhoDidThisProblem = orderResultByUserName(finishThisProblemUsersJson, "ALL");
                    $scope.finishCount = Object.keys(peopleWhoDidThisProblem).length;
                    defer.resolve()
//                    console.log("---------------------->"+peopleWhoDidThisProblem);
                })
            return promise
        }

        function get_exactRatio() {

            finishProblemCorrectUrl = TracksDataProvider.getUrl(finishProblem.correctQueryString);
            var defer = $q.defer();
            var promise = defer.promise
            $http.get(finishProblemCorrectUrl)
                .success(function (data) {
                    finishThisProblemCorrectUsersJson = data;
                    //console.log("finishThisProblemUsersJson----------->"+JSON.stringify(data));
                }).error(function (error) {
                    console.log("------>" + error);
                }).then(function (data) {
                    peopleWhoDidThisProblemCorrectTheFirstTime = [];
                    peopleWhoDidThisProblemCorrect = orderResultByUserName(finishThisProblemCorrectUsersJson, "CORRECT");
                    $scope.finishCorrectCount = Object.keys(peopleWhoDidThisProblemCorrect).length;
                    for (var key in peopleWhoDidThisProblemCorrect) {
                        if (peopleWhoDidThisProblem[key].first == peopleWhoDidThisProblemCorrect[key].first) {
//                                    console.log("--------------->user: "+key+" ---------->time: "+peopleWhoDidThisProblem[key].first);
                            peopleWhoDidThisProblemCorrectTheFirstTime.push(key);
                        }
                    }
                }).then(function (data) {
                    var finishCorrectTheFirstTimeCount = Object.keys(peopleWhoDidThisProblemCorrectTheFirstTime).length;
                    var exactRatio = finishCorrectTheFirstTimeCount / $scope.finishCount * 100;
                    defer.resolve(Math.round(exactRatio))

                })
            return promise
        }


    })






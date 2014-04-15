/**
 * Created by solomon on 14-4-2.
 */
/*angular.module('mixpanel.service',[])

.value('apiKey',"1291ff9d8ceb337db6a0069d88079474")
.value('apiSecret',"05b9aae8d5305855b1cdfec0db2db140")

.factory('MixpanelProvider',function(apiKey,apiSecret){

    var mixpanel = function(schema, args, api_secret){

        var sigGenerator = function(args, api_secret){
            args.sort();
            return CryptoJS.MD5(args.join('')+api_secret);
        };

        var sig = sigGenerator(args,api_secret);

        args.push("sig="+sig);

        var apiUrl = schema + "?" + args.join('&');
        return apiUrl;
    };

    return {
        mixpanel: mixpanel,
        apiKey: apiKey,
        apiSecret: apiSecret
    }
});*/

angular.module('track.service',[])
.value('apiSchema',"/tracks")
.factory('TracksDataProvider',function(apiSchema){
        console.log(apiSchema)
    var getUrl = function(queryString){
        var apiUrl = apiSchema + "?" + queryString;
        return apiUrl;
    };

    return {
        getUrl:getUrl
    }
})
angular.module("data.service",[])

    .factory("global", function ($http, $q) {
        var defer = $q.defer();
        var promise = defer.promise;
        var get_user = function () {
            $http.get('/me')
                .success(function (data, status, headers, config) {
                    defer.resolve(data);
                }).error(function (data, status, headers, config) {
                    defer.reject(data);
                });
            return promise;
        }
        return {get_user: get_user()}
    })

    .factory("RouteUrl", function ($http, $q) {

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

        var Request = GetRequest();
        var defer = $q.defer();
        var promise = defer.promise;
        var get_date = function () {
            var url = "/webapp"+ "/" + Request["ChapterId"] + "/" + Request["LessonId"] + "/lesson.json";
        $http.get(url)
                .success(function (data, status, headers, config) {
                    var activity_date = []
                    var i, j = data["activities"].length;
                    for (i = 0; i < j; i++) {
                        if (data["activities"][i].type == "quiz") {
                            activity_date.push(data["activities"][i])
                        }
                    }
                    var lesson_data = {title: data['title'], data: activity_date}
                    defer.resolve(lesson_data);
                }).error(function (data, status, headers, config) {
                    defer.reject(data);
                });
            return promise;
        }

        var get_body=function(problems){
            var body_of_problems = [];
            var i, j = problems.length;
            for (i = 0; i < j; i++) {
                var get_quiz_body = getPbody(problems[i]);
                body_of_problems.push({pbody: get_quiz_body['pbody'], imgbody: get_quiz_body['imgbody'], choices: problems[i]["choices"]})
            }
            return body_of_problems
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


        return {get_date: get_date(),
            get_chapterId:Request["ChapterId"],
            get_lessonId:Request["LessonId"],
            get_roomId:Request["Room"],
            get_body:get_body
        }
    })

    .factory('getrate',function($http,$q,RouteUrl,TracksDataProvider){
        var orderResultByUserName = function (data, type) {
            var defer = $q.defer();
            var promise = defer.promise;
            var mapFinal = {};
            angular.forEach(data, function (userRecord) {
                var username = userRecord.data.properties.UserName;
                if (mapFinal[username] == undefined) {
                    mapFinal[username] = [];
                    mapFinal[username].push(userRecord);
                    mapFinal[username].first = new Date(userRecord.headers.time).getTime();
                    defer.resolve(mapFinal)
                } else {
                    mapFinal[username].push(userRecord);
                    mapFinal[username].first = mapFinal[username].first < new Date(userRecord.headers.time).getTime() ? mapFinal[username].first : new Date(userRecord.headers.time).getTime();
                    defer.resolve(mapFinal)
                }
            });
            return promise;
        };

        var rate=function get_rate_of_all_wrong_question(problem){
            var correctRatio=[];
            var i, j = problem.length, all_problem_rate_of_activity = [];
            var defer = $q.defer();
            var promise = defer.promise;
            for (i = 0; i < j; i++) {
              var roomid = "~" + RouteUrl.get_roomId;
              get_peopleWhoDidThisProblem(roomid, problem[i].id)
                    .then(get_exactRatio).then(function (data) {
                        correctRatio.push(data);
                        if ( correctRatio.length == j - 1) {
                            defer.resolve(correctRatio)
                        }
                    }, function (err) {
                        alert(err)
                    })
            }
            return promise
        }

        var activitycorrectRatio=function(data,title){
            var Ratio={};
            var i, j = data.length, sum = 0;
            for (i = 0; i < j; i++) {
                sum = sum + data[i];
            }
            Ratio[title]=sum/j;
            return Ratio
        }

        function get_peopleWhoDidThisProblem(roomid, problemid) {
            var finishThisProblemUsersJson;
            var  finishProblem = {
                allQueryString: "$and=[{\"data.properties.UserName\":\"" + roomid + "\"},{\"data.event\":\"FinishProblem\"},{\"data.properties.ProblemId\":\"" + problemid + "\"}]&sort=data.properties.UserName",
                correctQueryString: "$and=[{\"data.properties.UserName\":\"" + roomid + "\"},{\"data.event\":\"FinishProblem\"},{\"data.properties.ProblemId\":\"" + problemid + "\"},{\"data.properties.CorrectOrNot\":true}]&sort=data.properties.UserName"
            };
            var finishProblemAllUrl = TracksDataProvider.getUrl(finishProblem.allQueryString);
            var defer = $q.defer();
            var promise = defer.promise;
            $http.get(finishProblemAllUrl)
                .success(function (data) {
                    finishThisProblemUsersJson = data;
                }).error(function (error) {
                    console.log("------>" + error);
                    defer.reject();
                }).then(function (data) {
                    orderResultByUserName(finishThisProblemUsersJson, "ALL").then(function(date){
                        var peopleWhoDidThisProblem =date;
                        var finishCount = Object.keys(peopleWhoDidThisProblem).length;
                        date={peopleWhoDidThisProblem:peopleWhoDidThisProblem,finishCount:finishCount,finishProblem:finishProblem}
                        defer.resolve(date)
                    },function(){});

                })
            return promise
        }

        function get_exactRatio(date) {
            var peopleWhoDidThisProblemCorrect;
            var finshdate=date;
            var finishThisProblemCorrectUsersJson;
            var finishProblemCorrectUrl = TracksDataProvider.getUrl(date.finishProblem.correctQueryString);
            var  peopleWhoDidThisProblemCorrectTheFirstTime;
            var defer = $q.defer();
            var promise = defer.promise
            $http.get(finishProblemCorrectUrl)
                .success(function (data) {
                    finishThisProblemCorrectUsersJson = data;
                }).error(function (error) {
                    console.log("------>" + error);
                }).then(function (data) {
                    peopleWhoDidThisProblemCorrectTheFirstTime = [];
                    orderResultByUserName(finishThisProblemCorrectUsersJson, "CORRECT").then(function(date){
                        peopleWhoDidThisProblemCorrect =date;
                        var finishCorrectCount = Object.keys(peopleWhoDidThisProblemCorrect).length;
                        for (var key in peopleWhoDidThisProblemCorrect) {
                            if (finshdate.peopleWhoDidThisProblem[key].first == peopleWhoDidThisProblemCorrect[key].first) {
                                peopleWhoDidThisProblemCorrectTheFirstTime.push(key);
                            }
                        }
                    },function(){});

                }).then(function (data) {
                    var finishCorrectTheFirstTimeCount = Object.keys(peopleWhoDidThisProblemCorrectTheFirstTime).length;
                    var exactRatio = finishCorrectTheFirstTimeCount / finshdate.finishCount * 100;
                    defer.resolve(Math.round(exactRatio))
                })
            return promise
        }

        return {wrong_rate:rate,
            activitycorrectRatio:activitycorrectRatio
        }

    })




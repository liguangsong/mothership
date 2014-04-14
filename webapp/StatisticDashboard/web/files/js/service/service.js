/**
 * Created by solomon on 14-4-2.
 */
angular.module('mixpanel.service',[])

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
});

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
//            $http.get("/webapp/c844f495-4a66-4cd0-b03c-a7a3155e22db/3a661cb0-ff43-4f8a-aa0c-74ad47b507ff/lesson.json")
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

        var finishProblem
        var finishThisProblemUsersJson;
        var finishThisProblemCorrectUsersJson;
        var peopleWhoDidThisProblem;
        var peopleWhoDidThisProblemCorrect;
        var peopleWhoDidThisProblemCorrectTheFirstTime;
        var finishProblemAllUrl;
        var finishProblemCorrectUrl;
        var finishCount;
        var Ratio={};
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

        var rate=function get_rate_of_all_wrong_question(problem){
            var correctRatio=[];
            var i, j = problem.length, all_problem_rate_of_activity = [];
            var defer = $q.defer();
            var promise = defer.promise;
            for (i = 0; i < j; i++) {
                var roomid = "~" + RouteUrl.get_roomId;
//              get_peopleWhoDidThisProblem(roomid, problem[i].id)
                get_peopleWhoDidThisProblem("~siba73", "a34edb11-b7ec-4602-9e6c-27f68878fccb")
                    .then(get_exactRatio).then(function (data) {
                        correctRatio.push(data);
                        if ( correctRatio.length == j - 1) {
                            defer.resolve(correctRatio)
                        }
                    }, function (err) {
                        alert(err)
                    })
//
            }
            return promise
        }

        var activitycorrectRatio=function(data,title){
            var i, j = data.length, sum = 0;
            for (i = 0; i < j; i++) {
                sum = sum + data[i];
            }
            Ratio[title]=sum/j;
            return Ratio
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
                    finishCount = Object.keys(peopleWhoDidThisProblem).length;
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
                    var finishCorrectCount = Object.keys(peopleWhoDidThisProblemCorrect).length;
                    for (var key in peopleWhoDidThisProblemCorrect) {
                        if (peopleWhoDidThisProblem[key].first == peopleWhoDidThisProblemCorrect[key].first) {
//                                    console.log("--------------->user: "+key+" ---------->time: "+peopleWhoDidThisProblem[key].first);
                            peopleWhoDidThisProblemCorrectTheFirstTime.push(key);
                        }
                    }
                }).then(function (data) {
                    var finishCorrectTheFirstTimeCount = Object.keys(peopleWhoDidThisProblemCorrectTheFirstTime).length;
                    var exactRatio = finishCorrectTheFirstTimeCount / finishCount * 100;
                    defer.resolve(Math.round(exactRatio))
                })
            return promise
        }

        return {wrong_rate:rate,
            activitycorrectRatio:activitycorrectRatio
        }

    })




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

        return {get_date: get_date(),
            get_chapterId:Request["ChapterId"],
            get_lessonId:Request["LessonId"],
            get_roomId:Request["Room"]
        }
    })



;



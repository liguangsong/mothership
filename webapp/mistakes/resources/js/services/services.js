angular.module('Mistakes.services', [])
    .factory('DataCache', function() {
        var navigatorMap = {};
        var allChapterArr = [];
        var allChapterMap = {};   //两个最好能只留一个
        var allUserProblemMap = {};
        //var materialMap = {};

        var TAGS = {
            wrong: "wrong",
            favorite: "favorite"
        }

        return {
            navigatorMap: navigatorMap,
            allChapterArr: allChapterArr,
            allChapterMap: allChapterMap,
            allUserProblemMap: allUserProblemMap
        }
    })

    .factory('APIProvider', function() {
        var HOST = '';
        var getAPI = function(type, args) {
            switch(type) {
                case 'getAllChapter' :
                    return HOST + "/apps?package_name=org.sunlib.exercise&type=chapter";
                case 'getLessonData' :
                    return HOST + args.chapterUrl + "/" + args.lessonId + "/lesson.json";
                case 'getFileResource' :
                    return HOST + args.chapterUrl + "/" + args.lessonId;
                case 'getAllUserProblemMap' :
                    return HOST + '/userdata/me/mistake';
                case 'getLessonUserdata' :
                    return HOST + '/userdata/' + args.appId + '/' + args.entityId;
                case 'putFavoriteUserdata' :
                    return HOST + '/userdata/' + args.appId + '/' + args.entityId;
            }
            return HOST;
        }

        return {
            getAPI: getAPI
        }
    })

    .factory('MaterialProvider', function($q, $http, DataCache, APIProvider) {
        var getNavigatorMap = function() {
            var deferred = $q.defer();
            var navigatorMapPromise = deferred.promise;

            if(Object.keys(DataCache.navigatorMap).length > 0) {
                deferred.resolve(DataCache.navigatorMap);
                return navigatorMapPromise;
            }

            var url = APIProvider.getAPI('getAllChapter');
            $http.get(url)
                .success(function(result) {
                    var allChapterArr = result.filter(function(item, index) {
                        if(item.subject=='math') {
                            return true;
                        }else{
                            return false;
                        }
                    })
                    DataCache.allChapterArr = allChapterArr;
                    console.log('最初拿到allChapteArr.length='+allChapterArr.length);
                    //DataCache.materialMap = generateMaterialMap(allChapterArr);
                    allChapterArr.forEach(function(chapter, index) {
                        DataCache.allChapterMap[chapter.id] = chapter;
                        var orderedChapterArr = generateOrderedChapter(chapter);
                        DataCache.navigatorMap[chapter.id] = orderedChapterArr;
                    })
                    deferred.resolve(DataCache.navigatorMap);
                })
                .error(function(err) {
                    alert('getAllChapter Error!');
                    deferred.reject('Error');
                })

            return navigatorMapPromise;
        }       

        var generateOrderedChapter = function(chapter) {
            var allLessons = [];
            var lessons = chapter.lessons;
            var mainLessonMap = {};
            var slaveLessonsMap = {};

            lessons.forEach(function (lesson, index) {
                lesson.parent_id = chapter.id;
                var requirements = lesson.requirements;
                var seq = lesson.seq;
                if (seq == 0 || lesson.mainline) {
                    if (!requirements) {
                        mainLessonMap.header = lesson;
                    } else {
                        var req = requirements[0];
                        mainLessonMap[req] = lesson;
                    }
                } else {
                    if (!requirements) {
                        if (!slaveLessonsMap.header) {
                            slaveLessonsMap.header = [];
                        }
                        var slaveLessons = slaveLessons.header;
                        slaveLessons.push(lesson);
                    } else {
                        var req = requirements[0];
                        if (!slaveLessonsMap[req]) {
                            slaveLessonsMap[req] = [];
                        }
                        var slaveLessons = slaveLessonsMap[req];
                        slaveLessons.push(lesson);
                    }
                }
            });

//主视频和副视频就位，那么就形成一维数组，返回此数组
            var header = mainLessonMap.header;
            var totalLength = Object.keys(mainLessonMap).length;
            var count = 0;
            (function arrCon(lesson) {
                if (count >= totalLength) {
                    return;
                }
                var newArr = [];
                newArr.push(lesson);
                allLessons.push(newArr);
                var newLesson = mainLessonMap[lesson.id];
                count++;
                arrCon(newLesson);
            }(header));

            allLessons.forEach(function (lessons, index) {
                var mainLesson = lessons[0];
                var slaveLessons = slaveLessonsMap[mainLesson.id];
                Array.prototype.push.apply(lessons, slaveLessons);
                sortForLessons(lessons);
            })

            var result = [];
            //result.push(chapter);
            allLessons.forEach(function(lessons, index) {
                result = result.concat(lessons);
            })
            console.log('allLessons.length='+allLessons.length);
            console.log('result.length='+result.length);
            return result;
        }  

        var sortForLessons = function (lessons) {
            for (var out = 1; out < lessons.length; out++) {
                var tmp = lessons[out];
                var tmpSeq = tmp.seq;
                var inner = out;
                while ((lessons[inner - 1]).seq > tmpSeq) {
                    lessons[inner] = lessons[inner - 1];
                    --inner;
                    if (inner <= 0) {
                        break;
                    }
                }
                lessons[inner] = tmp;
            }
        };              

        var getChapterData = function(cid) {
            var deferred = $q.defer();
            var chapterPromise = deferred.promise;

            if(DataCache.allChapterMap[cid]) {
                deferred.resolve(DataCache.allChapterMap[cid]);
                return chapterPromise;
            }

            getNavigatorMap().then(function(navigatorMap) {
                deferred.resolve(DataCache.allChapterMap[cid]);
            }, function(err) {
                deferred.reject('Error');
                alert('get a chapter from all chapters error');
            })

            return chapterPromise;
        }

        var getLessonData = function(lesson) {
    	var deferred = $q.defer();
    	var lessonPromise = deferred.promise;
             var cid = lesson.parent_id;
console.log('lesson.parent_id='+cid);
            if(DataCache.allChapterMap[cid]) {
                var chapterUrl = DataCache.allChapterMap[cid].url;
                var url = APIProvider.getAPI('getLessonData', {chapterUrl: chapterUrl, lessonId: lesson.id});
                $http.get(url)
                    .success(function(lessonData) {
                        deferred.resolve(lessonData);
                    })
                    .error(function(err) {
                        alert('getLessonData Error');
                        deferred.reject('Error');
                    })
            } else {
                console.log('No chapter exist');
                getChapterData(cid).then(function(chapter) {
                    var url = APIProvider.getAPI('getLessonData', {chapterUrl: chapter.url, lessonId: lid});
                    $http.get(url)
                        .success(function(lessonData) {
                            deferred.resolve(lessonData);
                        })
                }, function(err) {
                    deferred.reject('Error');
                    alert('get chapter error when get lesson data');
                })
            }
    	return lessonPromise; 
        }    

        var getLessonUserdata = function(lesson) {
            var deferred = $q.defer();
            var lessonUserdataPromise = deferred.promise;
            var cid = lesson.parent_id;

            var url = APIProvider.getAPI('getLessonUserdata', {appId: cid, entityId: lesson.id});
            console.log('getLessonUserdata.url = '+url);
            $http.get(url)
                .success(function(lessonUserdata) {
                    deferred.resolve(lessonUserdata);
                })
                .error(function(err) {
                    alert('getLessonUserdata Error');
                    deferred.reject('Error');
                })
            return lessonUserdataPromise;
        }  


        var getAllUserProblemMap = function() {
            var deferred = $q.defer();
            var allUserProblemPromise = deferred.promise;

            if(Object.keys(DataCache.allUserProblemMap).length > 0) {
                deferred.resolve(DataCache.allUserProblemMap);
                return allUserProblemPromise;
            }

            var url = APIProvider.getAPI('getAllUserProblemMap');
            $http.get(url)
                 .success(function(allUserProblemMap) {
                    console.log('getAllUserProblemMap.length='+Object.keys(allUserProblemMap).length);
                    DataCache.allUserProblemMap = allUserProblemMap;
                    console.log('allmistake: '+angular.toJson(allUserProblemMap));
                    deferred.resolve(allUserProblemMap);
                 })
                 .error(function(err) {
                    deferred.reject('Error');
                    alert('getMistakeMap Error');
                 })
            return allUserProblemPromise;
        }

        var getAllLessonProblemsMap = function(lesson) {
            var deferred = $q.defer();
            var lessonProblemsPromise = deferred.promise;
            var lessonProblemsMap = {};

            getLessonData(lesson).then(function(lessonData) {
                console.log('activities.length='+lessonData.activities.length);
                lessonData.activities.forEach(function(activity, index) {
                    if(activity.type == 'quiz') {
                        activity.problems.forEach(function(problem, index) {
                            problem.cid = lesson.parent_id;
                            problem.lid = lesson.id;
                            lessonProblemsMap[problem.id] = problem;                            
                        })
                    }
                })
                deferred.resolve(lessonProblemsMap);
                //console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=Here-=-=-=-=-=-=-=-=-=-=-=--=');
                //console.log(angular.toJson(lessonProblemsMap));
            }, function(err) {
                deferred.reject('Error');
                alert('get lessonData Error when getAllLessonProblemsMap');
            })

            return lessonProblemsPromise;
        }

        var getAllLessonProblemsUserdataMap = function(lesson) {
            var deferred = $q.defer();
            var lessonProblemsUserdataMapPromise = deferred.promise;
            var lessonProblemsUserdataMap = {};

            getLessonUserdata(lesson).then(function(lessonUserdata) {
                var activitiesUserdataMap = lessonUserdata.activities;
                for(var aid in activitiesUserdataMap) {
                    if(activitiesUserdataMap.hasOwnProperty(aid)) {
                        var activityUserdata = activitiesUserdataMap[aid];
                        if(activityUserdata.problems) {
                            var problemsUserdataMap = activityUserdata.problems;
                            for(var pid in problemsUserdataMap) {
                                if(problemsUserdataMap.hasOwnProperty(pid)) {
                                    lessonProblemsUserdataMap[pid] = problemsUserdataMap[pid];
                                }
                            }
                        }
                    }
                }
                deferred.resolve(lessonProblemsUserdataMap);
            }, function(err) {
                deferred.reject('Error');
                alert('get lessonUserdata Error when getAllLessonProblemsUserdataMap');
            })

            return lessonProblemsUserdataMapPromise;
        }

        return {
            getNavigatorMap: getNavigatorMap,
            getAllUserProblemMap: getAllUserProblemMap,
            getAllLessonProblemsMap: getAllLessonProblemsMap,
            getAllLessonProblemsUserdataMap: getAllLessonProblemsUserdataMap
        }
    })
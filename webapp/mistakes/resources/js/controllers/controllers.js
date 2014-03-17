angular.module('Mistakes.controllers', [])
    .controller('RootCtrl', function($scope, $location, DataCache) {
        var cid = DataCache.allChapterArr[0].id;
        var lid = DataCache.allChapterArr[0].lessons[0].id;
        $location.path('/chapter/'+cid+'/lesson/'+lid);
    })

    .controller('HomeCtrl', function($scope, DataCache, $routeParams, MaterialProvider, $q, APIProvider, $http, $compile) {
      console.log('Come in RootCtrl');
       var allChapterArr = $scope.allChapterArr = DataCache.allChapterArr;
       var allChapterMap = DataCache.allChapterMap;
       $scope.navigatorMap = DataCache.navigatorMap;

       $scope.totalProblemCount = 0;
       $scope.problemCountMap = {};
       for(var cid in DataCache.allUserProblemMap) {
           if(DataCache.allUserProblemMap.hasOwnProperty(cid)) {
               var chapterProblemsMap =  DataCache.allUserProblemMap[cid];
               var tempCount = 0;
               for(var lid in chapterProblemsMap) {
                  var lessonProblemArr = chapterProblemsMap[lid];
                  $scope.problemCountMap[lid] = lessonProblemArr.length;
                  tempCount += lessonProblemArr.length;
               }
               $scope.problemCountMap[cid] = tempCount;
               $scope.totalProblemCount += tempCount;
           }
       }       

       $scope.clickOnItem = function(item) {
            if(!item.type || (item.type != 'chapter')) {
                  $scope.selectLesson(item);
                  $scope.selectedLessonId = item.id;
            }else{
                 $scope.selectedChapterId = item.id;
            }
       }

       $scope.selectLesson = function(lesson) {
            if(!lesson) {
                  lesson = DataCache.allChapterArr[0].lessons[0];
                  lesson.parent_id = DataCache.allChapterArr[0].id;
                  $scope.selectedChapterId = lesson.parent_id;
                  $scope.selectedLessonId = lesson.id;
            }
            $scope.allProblemsArr = [];
           $scope.favoriteProblemsArr = [];
           var totalProblemMaterialProvider = {};
           var allLessonProblemsMapPromise = MaterialProvider.getAllLessonProblemsMap(lesson);
           var allLessonProblemsUserdataMapPromise = MaterialProvider.getAllLessonProblemsUserdataMap(lesson);
           allLessonProblemsMapPromise.then(function(allLessonProblemsMap) {
                totalProblemMaterialProvider.allLessonProblemsMap = allLessonProblemsMap;
           }, function(err) {
                console.log('getAllLessonProblemsMap Error in selectLesson');
           });
           allLessonProblemsUserdataMapPromise.then(function(allLessonProblemsUserdataMap) {
                totalProblemMaterialProvider.allLessonProblemsUserdataMap = allLessonProblemsUserdataMap;
                $scope.allLessonProblemsUserdataMap = allLessonProblemsUserdataMap;
           }, function(err) {
                console.log('getAllLessonProblemsUserdataMap Error in selectLesson');
           })

           $q.all([allLessonProblemsMapPromise, allLessonProblemsUserdataMapPromise]).then(function() {
               var allLessonProblemsMap = totalProblemMaterialProvider.allLessonProblemsMap;
               var allLessonProblemsUserdataMap = totalProblemMaterialProvider.allLessonProblemsUserdataMap;
               var tempAllProblemsArr = [];
               if(DataCache.allUserProblemMap[lesson.parent_id] && DataCache.allUserProblemMap[lesson.parent_id][lesson.id]) {
                   tempAllProblemsArr = DataCache.allUserProblemMap[lesson.parent_id][lesson.id];  //全部
                   tempAllProblemsArr.forEach(function(item, index) {
                        var target = allLessonProblemsMap[item.id];
                        target.tags = item.tags;
                        target.chapterId = lesson.parent_id;
                        target.lessonId = lesson.id;

                        getPbody(target);
                       $scope.allProblemsArr.push(target);
                   })
               }

               if(tempAllProblemsArr) {
                   tempAllProblemsArr.forEach(function(problem, index) {
                       if(problem.tags) {
                           var result = problem.tags.some(function(tag, index) {
                                if('favorite' == tag) {
                                     return true;
                                }else{
                                     return false;
                                }
                           })
                           if(result) {
                              var favoriteProblem = allLessonProblemsMap[problem.id];
                               favoriteProblem.tags = problem.tags;
                               favoriteProblem.is_favorite = true;
                               $scope.favoriteProblemsArr.push(favoriteProblem);                                 
                           }
                       }
                   })
               } 

               $scope.showCurrentProblems('all');              
           }, function(err) {
                console.log('get lessonProblemsMap Error in selectLesson');
           })
      }  

      var getPbody = function(target){
        var originBody = target.body;
          var tagIndex = originBody.indexOf("<ximage");
          if(tagIndex < 0) {
              target.pbody = originBody;
              target.haveImg = false;
              return;
          }
          target.haveImg = true;
          var bodyString = originBody.substring(0, tagIndex);

          var endIndex = originBody.indexOf("</ximage>", tagIndex);
          var imageString = originBody.substring(tagIndex, (endIndex+"</ximage>".length+1));

          target.imgbody = imageString;
          target.pbody = bodyString;          
      }

       $scope.showCurrentProblems = function(tag) {
            switch(tag) {
                 case 'all' :
                     $scope.tag = 'all';
                     $scope.currentProblems = $scope.allProblemsArr;
                     break;
                 case 'favorite' :
                     $scope.tag = 'favorite';
                     $scope.currentProblems = $scope.favoriteProblemsArr;
                     break;
            }
       }

       $scope.showProblem = function(problem) {
            var index = $scope.currentProblems.indexOf(problem);
            if(index == 0) {
                 $scope.isFirst = true;
                 $scope.isLast = false;
            }else if(index == $scope.currentProblems.length-1) {
                 $scope.isLast = true;
                 $scope.isFirst = false;
            }else{
                 $scope.isFirst = false;
                 $scope.isLast = false;
            }

            $scope.currentProblem = problem;
            $scope.currentProblemUserdata = $scope.allLessonProblemsUserdataMap[problem.id];            
            $scope.showHintBox = false;
            $scope.showExplanation = false;   

          $scope.body= "<span>"+$scope.currentProblem.body+"</span>";
            $scope.isShowProblem = true;

            if(problem.type != 'singlefilling') {
                $scope.currentProblem.choices.forEach(function(choice) {
                    choice.state = "default";
                })                 
            }            

            $scope.type = problem.type;
            if ((typeof problem.layout != "undefined") && (problem.layout == "card")) {
                $scope.layout = "card";
                $scope.colNum = "6";
            } else {
                $scope.layout = "list";
                $scope.colNum = "12";
            }      
       }

       $scope.showAnswer = function(problem) {
            if(problem.type != 'singlefilling') {
                $scope.currentProblem.choices.forEach(function(choice) {
                    if(choice.is_correct) {
                       choice.state = "correct";
                    }else{
                        var index = $scope.currentProblemUserdata.answer.indexOf(choice.id);
                        if(index>=0) {
                            choice.state = "wrong";
                        }else{
                           choice.state = "default";
                        }
                    }
                })                 
            }else{
                $scope.isSingleFilling = true;
                var answer = '';
                $scope.currentProblemUserdata.answer.forEach(function(item, index) {

                })
            }            
       }

      $scope.calcChoiceNum = function (index) {
           return String.fromCharCode(65 + index) + ".";
      };       

       $scope.preProblem = function() {
            var index = $scope.currentProblems.indexOf($scope.currentProblem);
            if((index-1) >= 0) {
               var problem = $scope.currentProblems[index-1];
               $scope.showProblem(problem);                              
            }
        }

       $scope.nextProblem = function() {
           var index = $scope.currentProblems.indexOf($scope.currentProblem);
           if((index+1) < $scope.currentProblems.length) {
                var problem = $scope.currentProblems[index+1];
                $scope.showProblem(problem);
           }
       }

       $scope.editFavorite = function(problem) {
            var content = {};
            problem.is_favorite = !problem.is_favorite;
            if(problem.is_favorite) {
                content.action = 'add';
                problem.tags = problem.tags.concat(["favorite"]);
                $scope.favoriteProblemsArr.push(problem);
            }else{
                content.action = 'remove';
                var tagIndex = problem.tags.indexOf("favorite");
                problem.tags.splice(tagIndex, 1);
                var index = $scope.favoriteProblemsArr.indexOf(problem);
                $scope.favoriteProblemsArr.splice(index, 1);
            }
            var putUrl = '/userdata/me/mistake';
            content.cid = problem.cid;
            content.lid = problem.lid;
            content.pid = problem.id;
            content.tags = problem.tags;
            var promise = $http({
                method: 'Put', 
                url: APIProvider.getAPI('putFavoriteUserdata', {"appId": "me", "entityId": "mistake"}),
                headers: {'Content-Type': 'application/json;charset:UTF-8'},
                data: JSON.stringify(content)                
            });
            promise.success(function() {
            }).error(function(err) {
                console.log('Edit Favorite Error');
            })            
       }

       $scope.backToNavigator = function() {
            var cid = $routeParams.cid;
            var lid = $routeParams.lid;
            window.location = "/webapp/navigator/#/subject/math/chapter/"+cid;
       }

       $scope.showAllChapter = function() {
            console.log('Show All The Chapters');
       }

      if($routeParams.cid && $routeParams.lid) {
          DataCache.allChapterMap[$routeParams.cid].lessons.forEach(function(item, index) {
               if(item.id == $routeParams.lid) {
                    $scope.selectLesson(item);
                    return;
               }
          })
      } else {
             console.log('Never Come In！！！');
            $scope.selectLesson();
      }

    })


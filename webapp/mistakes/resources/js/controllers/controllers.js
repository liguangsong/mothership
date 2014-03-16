angular.module('Mistakes.controllers', [])
    .controller('RootCtrl', function($scope, DataCache, $routeParams, MaterialProvider, $q, APIProvider, $http, $compile) {
      console.log('Come in RootCtrl');
       var allChapterArr = $scope.allChapterArr = DataCache.allChapterArr;
       var allChapterMap = DataCache.allChapterMap;
       $scope.navigatorMap = DataCache.navigatorMap;

       $scope.totalProblemCount = 0;
       $scope.problemCountMap = {};
       //$scope.lessonProblemCountMap = {};
       for(var cid in DataCache.allUserProblemMap) {
           if(DataCache.allUserProblemMap.hasOwnProperty(cid)) {
               //console.log('cid='+cid);
               var chapterProblemsMap =  DataCache.allUserProblemMap[cid];
               var tempCount = 0;
               for(var lid in chapterProblemsMap) {
                 // console.log('lid='+lid);
                  var lessonProblemArr = chapterProblemsMap[lid];
                //  console.log('-=-=-=-=-=-=-=-=-=-=-=-===-=-lessonProblemArr.length='+lessonProblemArr.length);
                  $scope.problemCountMap[lid] = lessonProblemArr.length;
                  tempCount += lessonProblemArr.length;
               }
               $scope.problemCountMap[cid] = tempCount;
               $scope.totalProblemCount += tempCount;
           }
       }       

//-------------------------------------------------------TODO------------------------------------------------------------------------------------------------
//TODO:1.继续完善selectLesson函数，注意tag是个数组，里面是打上的标签组成的数组    DONE
//           2.组成带有problem body的allProblmes和favoriteProblems                            DONE
//           3.再检查一遍count是否计算正确                                                                       DONE
//           4.写html中的repeate                                                                                      DONE
//           5.添加入口和添加错题，收藏题目的操作                                                             DONE
//           6.点击problem显示完整的题目，选项，自己选择的错误答案是什么...
                  //在problem.html中添加点击事件;实现点击函数;在原有的各种problem的基础上修改，实现展现：
                  //$scope.allProblemsArr和$scope.allProblemUserdataArr                       DONE
//           7.给问题的显示添加数学符号的编译                                                                   DONE
//           8.补全home.html里面的链接的点击函数，比如退出登陆，点击人名等                  DONE
//           9.实现收藏和取消收藏~                                                                                    DONE

//TODO:修复“添加收藏后不能及时看见”的bug
       $scope.clickOnItem = function(item) {
            if(!item.type || (item.type != 'chapter')) {
                  //maybe is lesson
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
       //generate the mistake problem list
            $scope.allProblemsArr = [];
           $scope.favoriteProblemsArr = [];
           var totalProblemMaterialProvider = {};
           var allLessonProblemsMapPromise = MaterialProvider.getAllLessonProblemsMap(lesson);
           var allLessonProblemsUserdataMapPromise = MaterialProvider.getAllLessonProblemsUserdataMap(lesson);
           allLessonProblemsMapPromise.then(function(allLessonProblemsMap) {
                totalProblemMaterialProvider.allLessonProblemsMap = allLessonProblemsMap;
           }, function(err) {
                alert('getAllLessonProblemsMap Error in selectLesson');
           });
           allLessonProblemsUserdataMapPromise.then(function(allLessonProblemsUserdataMap) {
                totalProblemMaterialProvider.allLessonProblemsUserdataMap = allLessonProblemsUserdataMap;
                $scope.allLessonProblemsUserdataMap = allLessonProblemsUserdataMap;
           }, function(err) {
                alert('getAllLessonProblemsUserdataMap Error in selectLesson');
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
                       $scope.allProblemsArr.push(target);
                   })
               }

               if(tempAllProblemsArr) {
                   tempAllProblemsArr.forEach(function(problem, index) {
                    //console.log('tags>>>>>>>>>>>>'+angular.toJson(problem.tags));
                       if(problem.tags) {
                           var result = problem.tags.some(function(tag, index) {
                                if('favorite' == tag) {
                                     return true;
                                }else{
                                     return false;
                                }
                           })
                           if(result) {
                       //     console.log('----------------------------------------------------One---------------------------------------------------------');
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
                alert('get lessonProblemsMap Error in selectLesson');
           })
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

            // $scope.mathContent = $scope.currentProblem.body;
            // var tempBody= "<span mathjax-bind='mathContent'></span>"
            // $scope.body =  $compile(tempBody)($scope);
          $scope.body= "<span>"+$scope.currentProblem.body+"</span>";
//console.log('body='+$scope.body);//title.commit = new Commit();
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
                      // console.log('is_correct!!!!!!!!!!!!!!!!!!!!');
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
              //show the singlefilling answer

            }            
       }

      $scope.calcChoiceNum = function (index) {
           return String.fromCharCode(65 + index) + ".";
      };       

       $scope.preProblem = function() {
            var index = $scope.currentProblems.indexOf($scope.currentProblem);
            //console.log('preProblem.index='+index);
            if((index-1) >= 0) {
               var problem = $scope.currentProblems[index-1];
               $scope.showProblem(problem);                              
            }
        }

       $scope.nextProblem = function() {
           var index = $scope.currentProblems.indexOf($scope.currentProblem);
           //console.log('nextProblem.index='+index);
           if((index+1) < $scope.currentProblems.length) {
                var problem = $scope.currentProblems[index+1];
                $scope.showProblem(problem);
           }
       }

       $scope.goBack = function() {
            $scope.isShowProblem = false;
       }

//--------------------------------------------------实现收藏功能！！！注意allUserProblemMap的添加tag, 然后需要写回！！！------------------------------------------------
       $scope.editFavorite = function(problem) {
            //修改内存中的favorite，然后再update服务端存储的problem数据
            var content = {};

            problem.is_favorite = !problem.is_favorite;
            if(problem.is_favorite) {
                //add tags---some tags
                content.action = 'add';
                problem.tags = problem.tags.concat(["favorite"]);
                $scope.favoriteProblemsArr.push(problem);
            }else{
                //remove
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
            //console.log('problem.tags='+angular.toJson(problem.tags));
            var promise = $http({
                method: 'PUT',
                url: APIProvider.getAPI('putFavoriteUserdata', {"appId": "me", "entityId": "mistake"}),
                headers: {'Content-Type': 'application/json;charset:UTF-8'},
                data: JSON.stringify(content)                
            });
            promise.success(function() {
                  //console.log('add favorite success!');
            }).error(function(err) {
                alert('add Favorite Error');
            })            
       }

       $scope.backToNavigator = function() {
            var cid = $routeParams.cid;
            var lid = $routeParams.lid;
            window.location = "/webapp/navigator/#/subject/math/chapter/"+cid;
       }

       $scope.showAllChapter = function() {
            console.log('展开全部章节');
       }

      $scope.selectLesson();

    })

    .controller('TestCtrl', function($scope) {
        $scope.title = "HellMagic";
    })


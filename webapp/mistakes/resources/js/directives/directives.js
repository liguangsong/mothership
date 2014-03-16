angular.module('Mistakes.directives', [])
    .directive('problem', function($compile) {
        return {
        	restrict: "E",
             templateUrl: "resources/partials/problem_body.html",
        	link: function($scope, $element, $attrs) {
        	}
        }
    })
    .directive("mathjaxBind", function ($compile) {
        return {
            restrict: "A",
            controller: ["$scope", "$element", "$attrs",
                function ($scope, $element, $attrs) {
                    setTimeout(function () {
                        $scope.$apply(function () {
                            $scope.$watch($attrs.mathjaxBind, function (value) {
                                $element.html(value == undefined ? "" : value);
                                $compile($element.contents())($scope);
                                console.log('value='+value);
                                MathJax.Hub.Queue(["Typeset", MathJax.Hub, $element[0]]);
                            });
                        });
                    }, 0);
                }]
        };
    })

/*    .directive('CurrentProblem', function() {
        return {
            restrict: 'E',
            templateUrl: 'resources/partials/current_problem.html',
            link: function($scope, $element, $attrs) {
                //TODO:整理出正确和错误的答案
                  //console.log('显示problem directive!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
            }
        }
    })  */
    .directive("ximage", function (APIProvider, $compile, $routeParams, $rootScope, DataCache) {
        return {
            restrict: "E",
            link: function ($scope, $element, $attrs) {
                var cid = $scope.mproblem.chapterId;
                var chapterUrl = DataCache.allChapterMap[cid].url;
                var lessonId = $scope.mproblem.lessonId;
                var tempSrc = APIProvider.getAPI("getFileResource", {chapterUrl: chapterUrl, lessonId: lessonId}, "");
                var template = "<img class='ximage' src='" + tempSrc
                    + "/" + $attrs.src + "' />";
                $element.html(template);
                $compile($element.contents())($scope);
            }
        }
    })   

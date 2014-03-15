angular.module('Mistakes.directives', [])
    .directive('problem', function($compile) {
        return {
        	restrict: "E",
             templateUrl: "resources/partials/problem_body.html",
        	link: function($scope, $element, $attrs) {
        	    console.log('~~~~~~~~~~~~problem.body='+$scope.mproblem.body+'~~~~~~~~~~~~~~~');      
        	}
        }
    })
    .directive("mathjaxBind", function () {
        return {
            restrict: "A",
            controller: ["$scope", "$element", "$attrs",
                function ($scope, $element, $attrs) {
                    setTimeout(function () {
                        $scope.$apply(function () {
                            $scope.$watch($attrs.mathjaxBind, function (value) {
                                console.log('parse the value!!!!!!!!!!!!!!!!!!!!!!!!!');
                                $element.html(value == undefined ? "" : value);
                                MathJax.Hub.Queue(["Typeset", MathJax.Hub, $element[0]]);
                            });
                        });
                    }, 0);
                }]
        };
    })
    .directive('CurrentProblem', function() {
        return {
            restrict: 'E',
            templateUrl: 'resources/partials/current_problem.html',
            link: function($scope, $element, $attrs) {
                //TODO:整理出正确和错误的答案
                  console.log('显示problem directive!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
            }
        }
    })  
    .directive("ximage", function (APIProvider, $compile, $routeParams, $rootScope) {
        return {
            restrict: "E",
            link: function ($scope, $element, $attrs) {
                var template = "<img class='ximage' src='" + APIProvider.getAPI("getFileResources", {chapterId: $rootScope.ids.cid, lessonId: $routeParams.lid}, "")
                    + "/" + $attrs.src + "' />";
                $element.html(template);
                $compile($element.contents())($scope);
            }
        }
    })    
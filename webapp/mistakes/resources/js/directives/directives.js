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
    .directive('singleChoiceProblem', function() {
        return {
            restrict: 'E',
            templateUrl: 'resources/partials/single_choice.html',
            link: function($scope, $element, $attrs) {
                
            }
        }
    })
    .directive('singleFillingProblem', function() {
        return {
            restrict: 'E',
            templateUrl: 'resources/partials/single_filling.html',
            link: function($scope, $element, $attrs) {

            }
        }
    })
    .directive('multiChocieProblem', function() {
        return {
            restrict: 'E',
            templateUrl: 'resources/partials/multichoice.html',
            link: function($scope, $element, $attrs) {

            }
        }
    })

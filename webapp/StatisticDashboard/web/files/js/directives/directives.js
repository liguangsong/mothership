angular.module('data.service')
    .directive("mathjaxBind", function () {

        return {
            restrict: "A",
            controller: ["$scope", "$element", "$attrs","$compile",
                function ($scope, $element, $attrs,$compile) {
                    setTimeout(function () {
                        $scope.$apply(function () {
                           $scope.$watch($attrs.mathjaxBind, function (value) {
                                $element.html(value == undefined ? "" : value);
                                $compile($element.contents())($scope);
                                MathJax.Hub.Queue(["Typeset", MathJax.Hub, $element[0]]);
                            });
                        });
                    }, 0);
                }]
        };
    })
    .directive('problem', function($compile) {
        return {
            restrict: "E",
            templateUrl: "files/partials/problem_body.html",
            link: function($scope, $element, $attrs) {
//                console.log('~~~~~~~~~~~~problem.body='+$scope.mproblem.body+'~~~~~~~~~~~~~~~');
            }
        }
    })
    .directive("ximage", function ($compile,RouteUrl) {
        return {
            restrict: "E",
            link: function ($scope, $element, $attrs) {
                var template ="<img class='ximage' src='/webapp/" +RouteUrl.get_chapterId+"/"+RouteUrl.get_lessonId+"/"+$element[0]['attributes'][0].nodeValue
                    + "' />";
                $element.html(template);
                $compile($element.contents())($scope);
            }
        }
    })
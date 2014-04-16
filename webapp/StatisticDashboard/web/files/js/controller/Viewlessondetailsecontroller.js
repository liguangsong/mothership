angular.module('lesson-details', ['track.service', 'data.service'])
    .controller('Viewlessondetailsecontroller', function ($scope, $http, $q, TracksDataProvider, global, RouteUrl, getrate) {

        $scope.correctRatio = [];
        $scope.activitycorrectRatio = {};
        global.get_user.then(function (data) {
            $scope.user = data;
        }, function (data) {
            console.log("no login");
        })

        RouteUrl.get_date.then(function (lessonData) {
            $scope.title = lessonData['title'];
            $scope.date = lessonData["data"]
            $scope.quizs = lessonData["data"][0];
            $scope.selectedId=$scope.date[0].id;
            $scope.problems = RouteUrl.get_body($scope.quizs.problems)
//            $('#lessonLoaderModal').modal('show');
            get_wrong_rate_of_activity();
        }, function () {
            alert('getLessonMap Error');
        })

        $scope.show_mistake_of_activity = function (id) {
            var i, j = $scope.date.length, title;
            for (i = 0; i < j; i++) {
                if ($scope.date[i].id == id) {
                    title = $scope.date[i].title;
                    $scope.quizs = $scope.date[i];
                    $scope.problems = RouteUrl.get_body($scope.quizs.problems)
                    $scope.selectedId=$scope.date[i].id;
                    $('#lessonLoaderModal').modal('show');
                    get_wrong_rate_of_activity($scope.quizs);
                }
            }
        }

        $scope.showProblem = function (problem) {
            $scope.currentProblem = problem;
            $scope.colNum = problem.choices.length;
        }

        $scope.calcChoiceNum = function (index) {
            return String.fromCharCode(65 + index) + ".";
        };

        function get_wrong_rate_of_activity(quizs) {
            getrate.wrong_rate($scope.quizs["problems"]).then(function (data) {
                $scope.correctRatio = data;
                $scope.activitycorrectRatio = getrate.activitycorrectRatio(data, $scope.quizs.title)
                $('#lessonLoaderModal').modal('hide');
            }, function (err) {
                alert(err)
            })
        }
    })






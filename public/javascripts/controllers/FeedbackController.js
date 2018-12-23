/**
 * Created by rajasekhar on 18-Jun-17.
 */

var app = angular.module('PubGenDocsPages');
app.controller('feedbackCtrl', ['$scope', '$mdToast', 'feedbackCtrlService', function ($scope, $mdToast, FeedbackCtrlService) {

    $scope.feedback = FeedbackCtrlService.getConfig();
    $scope.close = function () {
        $mdToast.hide();
    };

}]);
/**
 * Created by rajasekhar on 18-Jun-17.
 */

var app = angular.module('PubGenDocsPages', ['ngMaterial', 'ngRoute','ngMdIcons']);
app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/addAPIProxy',
            {
                controller: 'AddSwaggerController',
                templateUrl: '/APIPublish/html/SwaggerTemplates/add-swagger-template.html'
            }).when('/updateAPIProxy',
        {
            controller: 'updateModel',
            templateUrl: '/APIPublish/html/SwaggerTemplates/update-swagger-template.html'
        }).otherwise('/addAPIProxy',
        {
            controller: 'AddSwaggerController',
            templateUrl: '/html/SwaggerTemplates/add-swagger-template.html'
        })
}]);

app.controller('MainController', ['$scope', '$location', function ($scope, $location) {

    function changeform() {
        if ($location.$$path === '/addAPIProxy' ){
            $scope.selectedForm = 'addAPIProxy';
        } else if ($location.$$path === '/updateAPIProxy' ) {
            $scope.selectedForm = 'updateAPIProxy';
        } else if ($location.$$path === '') {
            $scope.selectedForm = 'addAPIProxy';
        }
    };
    changeform();
    $scope.changeAPIProxyOpt = function(apiProxyOpt){
        window.location = 'http://api.247-inc.net:8083/APIPublish#!/addAPIProxy'
        // if (apiProxyOpt === 'addAPIProxy'){
        //     $scope.selectedForm = 'addAPIProxy';
        //     $location.path('addAPIProxy'); // path not hash
        // } else if(apiProxyOpt === 'updateAPIProxy') {
        //     $scope.selectedForm = 'updateAPIProxy';
        //     $location.path('updateAPIProxy'); // path not hash
        // }
    };
}]);
/**
 * Created by rajasekhar on 25-Apr-17.
 */
"use strict";
var app = angular.module('PubGenDocsPages');
app.service('CommonService', ['$http', '$q', function ($http,  $q) {
    var parenMenu = undefined;
    this.addModel = function (model) {
        $http.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded';
        var deferred = $q.defer();
        $http.post('/APIPublish/model/addModel', {data : {model : model}}).then(function (res) {
            deferred.resolve(res.data)
        }).catch(function (error) {
            deferred.reject(error.data);
        });
        return deferred.promise;
    };

    this.updateModel = function (model) {
        var deferred = $q.defer();
        $http.put('/APIPublish/model/updateModel', {data : {model : model}}).then(function (res) {
            deferred.resolve(res.data)
        }).catch(function (error) {
            deferred.reject(error.data);
        });
        return deferred.promise;
    };

    this.listModels = function () {
        var deferred = $q.defer();
        $http.get('/APIPublish/apimodels').then(function (res) {
            deferred.resolve(res.data)
        }).catch(function (error) {
            deferred.reject(error.data);
        });
        return deferred.promise;
    };

    this.getModelByID = function (config) {
        var deferred = $q.defer();
        var queryParam = 'name='+config.modelName+'&model_id='+config.model_id+'&latest_revision_number='+config.latest_revision_number;
        $http.get('/APIPublish/apimodel?'+queryParam).then(function (res) {
            deferred.resolve(res.data)
        }).catch(function (error) {
            deferred.reject(error.data);
        });
        return deferred.promise;
    };
}]);
app.service('apiModel', [function () {
    return {
        SwaggerURL: 'swaggerurl',
        ProxyURL: 'proxyurl',
        product: 'product',
        platform: 'platform',
        reviewerEmail: 'reviewer',
        isSandBoxAvailable: 'isSandBoxAvailable'
    }
}]);
app.service('products', function () {
    return [
        appConfig.properties['products.aiva'],
        appConfig.properties['products.active-share'],
        appConfig.properties['products.platform'],
        appConfig.properties['products.chat'],
        appConfig.properties['products.speech']
        ];
});
app.service('platform', function () {
    return [
        appConfig.properties['products.platform.data'],
        appConfig.properties['products.platform.central'],
    ];
});
app.service('feedbackCtrlService', ['$mdToast', '$q', function ($mdToast, $q) {
    var toastConfig;

    function popNotification(template, config) {
        closeNotification().then(function () {
            toastConfig = config;
            $mdToast.show({
                controller: 'feedbackCtrl',
                templateUrl: template,
                parent: angular.element(document.body),
                hideDelay: config.hideDelay,
                position: 'top'
            });
        });

    }

    function closeNotification() {
        var deferred = $q.defer();
        deferred.resolve();
        return deferred.promise;
    }

    return {
        getConfig : function () {
            return toastConfig;
        },
        success: function (config) {
            config.hideDelay = config.hideDelay ? config.hideDelay : 1500;
            return popNotification('/APIPublish/html/FeedbackTemplates/success-feedback-tpl.html', config);
        },

        error: function(config) {
            config.hideDelay = 0;
            return popNotification('/APIPublish/html/FeedbackTemplates/error-feedback-tpl.html', config);
        },


        progress: function(config) {
            config.hideDelay = 0;
            return popNotification('/APIPublish/html/FeedbackTemplates/progress-feedback-tpl.html', config);
        },

        close: closeNotification,
        hide : function () {
            $mdToast.hide();
        }
    }
}]);
app.service('Utils',[ 'apiModel', function (apiModel) {
    var emailReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return {
        isValidateEmail : function (model) {
            if (model[apiModel.reviewerEmail] === '' || model[apiModel.reviewerEmail] === undefined ||  !emailReg.test(model[apiModel.reviewerEmail])) {
                return false;
            }

            if (model[apiModel.reviewerEmail].endsWith(appConfig.properties['247-email-domains.inc-com']) === true ||  model[apiModel.reviewerEmail].endsWith(appConfig.properties['247-email-domains.ai']) === true ) {
                return true;
            }
            return false;
        }
    }
}]);
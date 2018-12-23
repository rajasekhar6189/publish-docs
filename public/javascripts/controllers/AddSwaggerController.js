/**
 * Created by rajasekhar on 18-Jun-17.
 */
var app = angular.module('PubGenDocsPages');
app.controller('AddSwaggerController',['$rootScope', '$scope', 'CommonService', '$timeout', 'feedbackCtrlService', 'Utils', 'apiModel','products','platform',
    function ($rootScope, $scope,  CommonService, $timeout, feedbackCtrlService, Utils, apiModel, products, platform) {
    $scope.modelSubmit = appConfig.properties['labels.SUBMIT'];
    $scope.submitDisable = false;
    $scope.serverSideValidationMessages = {
        invalidSwaggerURL: {
            status : false,
            errorMessage : ''
        },
        invalidSwaggerJSON: {
            status : false,
            errorMessage : ''
        },
        invalidAPIProxyURl: {
            status: false,
            errorMessage: ''
        },
        apiModelNameConflicts : {
            status: false,
            errorMessage: ''
        }
    };
    $scope.products = products;
    $scope.platform = platform;
    $scope.clientSideModelValidaMesg = {
        proxyurl: {
            message: appConfig.properties['inputFieldValidation.APIProxyOrEndPoint'],
            showMessage: false
        },
        swaggerurl: {
            message: appConfig.properties['inputFieldValidation.swaggerURL'],
            showMessage: false
        },
        product: {
            message: appConfig.properties['inputFieldValidation.product'],
            showMessage: false
        },
        platform: {
            message: appConfig.properties['inputFieldValidation.platform'],
            showMessage: false
        },
        reviewer: {
            message: appConfig.properties['inputFieldValidation.reviewerEmail'],
            showMessage: false
        }
    };
    $scope.model = {
        isSandBoxAvailable : 'true'
    };

    function isValidModel(model) {
        var isValid = true;
        var keys = undefined;
        if (model[apiModel.product] == appConfig.properties['products.platform']) {
            keys = [apiModel.SwaggerURL , apiModel.ProxyURL, apiModel.product, apiModel.platform, apiModel.reviewerEmail];
        } else {
            keys = [apiModel.SwaggerURL , apiModel.ProxyURL, apiModel.product, apiModel.reviewerEmail];
        }

        for (var index in keys) {
            if (model[keys[index]] === '' || model[keys[index]] === undefined){
                $scope.clientSideModelValidaMesg[keys[index]].showMessage = true;
                isValid = false;
            } else {
                $scope.clientSideModelValidaMesg[keys[index]].showMessage = false;
            }
        }
        if (!Utils.isValidateEmail(model)) {
            $scope.clientSideModelValidaMesg[apiModel.reviewerEmail].showMessage = true;
            isValid = false;
        }
        return isValid;
    };
    $scope.changePlatform = function (model) {
        model.platform = '';
    };
    $scope.submit = function (addModelFrom, model) {
        if (!isValidModel(model)){
            $scope.modelSubmit = appConfig.properties['labels.SubmitFailed'];
            $scope.submitDisable = true;
            return;
        }
        $scope.modelSubmit = appConfig.properties['labels.SUBMITTING'];
        $scope.submitDisable = true;
        feedbackCtrlService.progress({message : appConfig.properties['commonMessages.deploying']});
        CommonService.addModel(model).then(function (res) {
            feedbackCtrlService.close();
            feedbackCtrlService.success({message : res.message});
            $scope.modelSubmit = appConfig.properties['labels.SUBMITTED'];
            setTimeout(function () {
                $scope.modelSubmit = appConfig.properties['labels.SUBMIT'];
                $scope.submitDisable = false;
            }, 1800);
            showErrorMesgAtFields(undefined);
            clearInputs();
        }).catch(function (error) {
            feedbackCtrlService.hide();
            $scope.modelSubmit = appConfig.properties['labels.SubmitFailed'];
            $scope.submitDisable = true;
            if (error && error.hasOwnProperty('errorMessageCode')){
                if (error.errorMessageCode === 'invalidSwaggerJSON'){
                    feedbackCtrlService.close();
                    feedbackCtrlService.error({errorCode : error.errorMessageCode, message : appConfig.properties['commonMessages.deploymentFailed'], subMessage : error.message});
                } else {
                    showErrorMesgAtFields(error);
                    if (error.errorMessageCode != 'invalidSwaggerURL' && error.errorMessageCode != 'invalidAPIProxyURl' ) {
                        feedbackCtrlService.close();
                        feedbackCtrlService.error({message : appConfig.properties['commonMessages.deploymentFailed'], subMessage : error.message});
                    }
                }
            }
        })
    };
    function showErrorMesgAtFields (error) {
        var errorMessageCode = undefined;
        if (error != undefined) {
            errorMessageCode = error.errorMessageCode;
        }
        var serverSideValidationMessages = $scope.serverSideValidationMessages;
        for (var key in serverSideValidationMessages) {
            if (key === errorMessageCode) {
                $scope.serverSideValidationMessages[key].errorMessage = error.message;
            } else {
                $scope.serverSideValidationMessages[key].errorMessage = undefined;
            }
        }
    }
    $scope.updateErrorMessages = function(model, fieldName, severErrorCode) {
        $scope.modelSubmit = appConfig.properties['labels.SUBMIT'];
        $scope.serverSideValidationMessages['apiModelNameConflicts'].errorMessage = undefined;
        if (model[fieldName] === '' || model[fieldName] === undefined) {
            $scope.clientSideModelValidaMesg[fieldName].showMessage = true;
        } else {
            $scope.clientSideModelValidaMesg[fieldName].showMessage = false;
        }
        if (severErrorCode){
            $scope.serverSideValidationMessages[severErrorCode].errorMessage = undefined;
        }
        var keys = [apiModel.SwaggerURL , apiModel.ProxyURL, apiModel.product, apiModel.platform, apiModel.reviewerEmail];
        for (var index in keys) {
            if ($scope.clientSideModelValidaMesg[keys[index]].showMessage) {
                $scope.submitDisable = true;
                return;
            }
        }
        $scope.submitDisable = false;
    };
    function clearInputs() {
        $scope.model = {
            isSandBoxAvailable : 'true',
            swaggerurl : "",
            proxyurl : "",
            product : "",
            reviewer : ""
        };
    }
    $scope.getProperty = function (propertyName) {
        return appConfig.properties[propertyName];
    }
}]);
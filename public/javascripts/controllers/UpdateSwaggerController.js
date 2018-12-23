/**
 * Created by rajasekhar on 18-Jun-17.
 */
var app = angular.module('PubGenDocsPages');
app.controller('updateModel',['$scope', 'CommonService','feedbackCtrlService', 'apiModel', 'Utils', 'products','platform',
    function ($scope, CommonService, feedbackCtrlService, apiModel, Utils, products, platform) {
    $scope.modelSubmit = appConfig.properties['labels.SUBMIT'];;
    $scope.products = products;
    $scope.platform = platform;
    $scope.serverSideValidationMessages = {
        invalidSwaggerURL: {
            status : false,
            errorMessage : ''
        },
        apiModelNotFound: {
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
    $scope.modelsList = [];
    function clearValidationMesg() {
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
    }
    $scope.initializeValidationMesg = function () {
        clearValidationMesg();
    };
    $scope.changePlatform = function (model) {
        model.platform = '';
    };
    function isValidModel(model) {
        var isValid = true;
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
    }
    function loadModels(){
         CommonService.listModels().then(function (models) {
            $scope.modelsList = models;
        }).catch(function (error) {
        });
    }
    loadModels();
    function getModelConfig(modelName) {
        var models = $scope.modelsList;
        for ( var index in models) {
                if ( models[index].name === modelName) {
                    return {
                        modelName : modelName,
                        model_id  : models[index].id,
                        latest_revision_number : models[index].latestRevisionNumber
                    }
                }
        }

    }
    $scope.getModelDetails = function (modelName) {
        var config = getModelConfig(modelName);
         CommonService.getModelByID(config).then(function (model) {
             // model.isSandBoxAvailable = model.isSandBoxAvailable.toLowerCase().toString() === "true" ? true : false;
            $scope.model =  model;
             clearValidationMesg();
        }).catch(function (error) {
             $scope.model = {
                 swaggerurl : "",
                 proxyurl : "",
                 product : "",
                 reviewer : ""
             };
        })
    };
    $scope.update = function (updateModelFrom, model) {
        if (!isValidModel(model)){
            $scope.modelSubmit = appConfig.properties['labels.SubmitFailed'];
            $scope.submitDisable = true;
            return;
        }
        $scope.modelSubmit = appConfig.properties['labels.SUBMITTING'];;
        $scope.submitDisable = true;
        feedbackCtrlService.progress({message : appConfig.properties['commonMessages.updating']});
         CommonService.updateModel(model).then(function (res) {
             $scope.modelSubmit = appConfig.properties['labels.SUBMITTED'];
             setTimeout(function () {
                 $scope.modelSubmit = appConfig.properties['labels.SUBMIT'];
                 $scope.submitDisable = false;
             }, 1800);
             feedbackCtrlService.close();
             feedbackCtrlService.success({message : res.message});
             showErrorMesgAtFields(undefined);
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
                $scope.submitDisable = false;
                return;
            }
        }
        $scope.submitDisable = false;

    };
    $scope.getProperty = function (propertyName) {
        return appConfig.properties[propertyName];
    }
}]);

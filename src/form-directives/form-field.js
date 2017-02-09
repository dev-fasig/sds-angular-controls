/**
 * Created by stevegentile on 12/19/14.
 */
/**
 * Created by stevegentile on 12/19/14.
 */
(function () {
    'use strict';
    function formField ($filter, $timeout) {
        return{
            restrict: 'EA',
            transclude: true,
            replace: true,
            scope: {
                record                  : '=' , //two-way binding
                isRequired              : '=?',
                isReadonly              : '=?',
                isAutofocus             : '=?',
                field                   : '@' , //one-way binding
                label                   : '@' ,
                layout                  : '@?',
                labelCss                : '@?',
                layoutCss               : '@?',
                showLabel               : '=?',
                errorLayoutCss          : '@?',
                hideValidationMessage   : '=?',  //default is false
                log                     : '@?',
                validationFieldName     : '@?'  //to override the default label   '[validationFieldName]' is required
            },
            templateUrl: 'sds-angular-controls/form-directives/form-field.html',
            require: '^form',
            controller: function ($scope){
                this.$scope = $scope;
            },
            link: function($scope, element, attrs, form){
                //include a default form-input if no transclude included
                $scope.showDefault = false;
                $timeout(function(){
                    if(element.find('ng-transclude *').length === 0){
                        $scope.showDefault = true;
                    }
                });
                //end include

                if(!$scope.label){
                    $scope.label = $filter("labelCase")($scope.field);
                }

                $scope.validationFieldName = $scope.validationFieldName || $filter("labelCase")($scope.label);
                $scope.showLabel = $scope.showLabel !== false; // default to true
                $scope.hideValidationMessage = $scope.hideValidationMessage || false;
                $scope.layoutCss = $scope.layoutCss || "col-md-12";
                $scope.errorLayoutCss = $scope.errorLayoutCss || "col-md-12";

                $scope.layout = $scope.layout || "stacked";
                if($scope.layout === "horizontal"){
                    $scope.labelCss = $scope.labelCss || "col-md-4";
                }

                //validation ie. on submit
                $scope.showError = function(field){
                    try{
                        if(form.$submitted){
                            return field.$invalid;
                        }else if (element.find('[name=' + field.$name + ']:focus').length) {
                            return false;
                        }else{
                            return field.$dirty && field.$invalid;
                        }
                    }
                    catch(err){
                        return false;
                    }
                };
            }
        };
    }

    angular.module('sds-angular-controls').directive('formField', formField);
})();


(function () {
    'use strict';
    function formControl ($timeout) {
        return{
            restrict: 'A',
            require: '^form-field, ngModel',
            compile: function (tElement, tAttrs){
                tElement.attr('ng-model', 'container.record[container.field]');
                tElement.attr('ng-required', 'container.isRequired');
                tElement.attr('ng-disabled', 'container.isReadonly');
                tElement.attr('name', '{{::container.field}}');
                return function (scope, element, attr, containers) {
                    var input = element.find('input');
                    var ngModel = containers[1];
                    var formField = containers[0];
                    scope.container = formField.$scope;

                    if (attr.min){
                        formField.$scope.min = attr.min;
                    }
                    if (attr.max){
                        formField.$scope.max = attr.max;
                    }

                    var name = attr.name || attr.ngModel.substr(attr.ngModel.lastIndexOf('.')+1);
                    formField.$scope.field = name;

                };
            }
        };
    }

    angular.module('sds-angular-controls').directive('formControl', formControl);

})();

(function () {
    'use strict';
    function formDateTimePicker ($timeout) {
        return{
            restrict: 'EA',
            require: '^form-field',
            replace: true,
            scope: {
                dateFormat       : '@',
                modelOptions     : '=?',
                max              : '=?',
                min              : '=?',
                style            : '@?',
                layoutCss        : '@?' //default col-md-6
            },
            templateUrl: 'sds-angular-controls/form-directives/form-date-time-picker.html',

            link: function (scope, element, attr, container) {
                var input = element.find('input');
                scope.container = container.$scope;

                switch(container.$scope.layout){
                    case "horizontal":
                        scope.layoutCss = scope.layoutCss || "col-md-6";
                        break;
                    default: //stacked
                        scope.layoutCss = scope.layoutCss || "";
                }

                if (container.$scope.isAutofocus){
                    $timeout(function (){element.find('input').focus(); });
                }

                scope.dateFormat = scope.dateFormat || "MM-dd-yyyy";

                scope.calendar = {opened: false};
                scope.open = function($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    scope.calendar.opened = true;
                };

                scope.$watch('container.record[container.field]', function (val){
                    if (typeof val === 'string'){
                        container.$scope.record[container.$scope.field] = moment.utc(container.$scope.record[container.$scope.field]).toDate();
                    }
                });

                scope.$watch("container.isReadonly", function(newVal){
                    if(newVal) {
                        var date = moment(scope.container.record[scope.container.field]);
                        scope.readOnlyModel = date.format(scope.dateFormat.toUpperCase()) + date.format(' h:mm a');
                    }
                });

                if (scope.max) {
                    container.$scope.max = moment(scope.max).format(scope.dateFormat);
                }
                if (scope.min) {
                    container.$scope.min = moment(scope.min).format(scope.dateFormat);
                }
            }
        }
    }

    angular.module('sds-angular-controls').directive('formDateTimePicker', formDateTimePicker);
})();

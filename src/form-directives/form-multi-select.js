/**
 * Created by stevegentile on 12/19/14.
 */
(function () {
    'use strict';
    function formMultiSelect ($timeout) {
        return{
            restrict: 'EA',
            require: '^formField',
            replace: true,
            scope: {
                items           : '=',
                groups          : '=?',
                itemKey         : '@?',
                itemValue       : '@?',
                itemGroupKey    : '@?',
                itemGroupValue  : '@?',
                sortField          : '@?',
                allowCustom     : '=?',
                style           : '@?',
                layoutCss       : '@?' //default col-md-6
            },
            templateUrl: 'sds-angular-controls/form-directives/form-multi-select.html',

            link: function (scope, element, attr, container) {
                var input = element.find('select');
                scope.container = container.$scope;

                // one-time bindings:
                switch(container.$scope.layout){
                    case "horizontal":
                        scope.layoutCss = scope.layoutCss || "col-md-6";
                        break;
                    default: //stacked
                        scope.layoutCss = scope.layoutCss || "";
                }

                if (container.$scope.isAutofocus){
                    $timeout(function (){element.find('select').focus(); });
                }

                scope.$watch("container.isReadonly", function(newVal){
                    if(newVal) {
                        if (scope.container.record && scope.container.record[scope.container.field]) {

                            var value = scope.items[scope.container.record[scope.container.field]];
                            //if using itemKey/itemValue -we need to find it in the array vs. hash:
                            if(scope.itemValue && scope.itemKey){
                                var arrayItem = _.find(scope.items, function(item){
                                    return item[scope.itemKey] === scope.container.record[scope.container.field];
                                });
                                value = arrayItem[scope.itemValue];
                            }
                            scope.readOnlyModel = value;
                        }
                    }
                });

                var options = {
                    plugins: ['remove_button'],
                    valueField: scope.itemKey,
                    labelField: scope.itemValue,
                    searchField: [scope.itemValue],
                    maxOptions: 10
                };

                if(scope.sortField) {
                    options.sortField = scope.sortField;
                }

                if (scope.allowCustom){
                    options.persist = false;
                    options.create = true;
                }

                if (scope.itemGroupKey && _.isArray(scope.groups)){
                    options.optgroups =  scope.groups;
                    options.optgroupField = scope.itemGroupKey;
                    options.optgroupValueField = scope.itemGroupKey;
                    options.optgroupLabelField = scope.itemGroupValue;
                }

                scope.options = options;
            }
        }
    }

    angular.module('sds-angular-controls').directive('formMultiSelect', formMultiSelect);
})();

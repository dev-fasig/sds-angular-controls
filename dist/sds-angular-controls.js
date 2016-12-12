/*! 
 * sds-angular-controls
 * Angular Directives used with sds-angular generator
 * @version 0.5.2 
 * 
 * Copyright (c) 2016 Steve Gentile, David Benson 
 * @link https://github.com/SMARTDATASYSTEMSLLC/sds-angular-controls 
 * @license  MIT 
 */ 
angular.module('sds-angular-controls', ['ui.bootstrap', 'toggle-switch', 'ngSanitize', 'selectize-ng', 'currencyMask']);

(function (){
  'use strict';

  function camelCase (){
    return function (input) {
      return input.toLowerCase().replace(/ (\w)/g, function (match, letter) {
        return letter.toUpperCase();
      });
    };
  }

  angular.module('sds-angular-controls').filter('camelCase', camelCase);
})();

(function (){
    'use strict';

    function complexFilter ($filter){
        return function(input,arg) {
            if (typeof arg === "string"){
                return $filter('filter')(input, arg);

            }else {
                var prop = function (obj, key){
                    var arr = key.split(".");
                    while(arr.length && (obj = obj[arr.shift()])); // jshint ignore:line
                    return obj;
                };


                var filters = [];
                // setup filters
                _.each(arg, function (col) {
                    if (col.type === 'date' && col.filter) {
                        var d = col.filter.split("-");
                        var d1 = moment(d[0]);
                        var d2 = moment(d[1] || d1.clone().endOf('day'));
                        if (d1.isValid() && d2.isValid()) {
                            filters.push({
                                filter: [d1.valueOf(), d2.valueOf()],
                                key: col.key,
                                type: col.type
                            });
                        }
                    } else if ((col.type === 'number' || col.type === 'int') && col.filter) {
                        var n = col.filter.split("-");
                        if (!n[0] && n[1]) {

                            n.shift();
                            n[0] *= -1;

                        }
                        if (!n[1] && n[2]) {

                            n.splice(1, 1);
                            n[1] *= -1;

                        }
                        if (n[1] === ""){
                            n[1] =  Number.MAX_VALUE;
                        }
                        var n1 = parseFloat(n[0]);
                        var n2 = parseFloat(n[1] || n[0]);
                        filters.push({
                            filter: [n1, n2],
                            key: col.key,
                            type: col.type
                        });
                    }else if ((col.type === 'boolean' || col.type === 'bool') && col.filter){

                        if (/^(0|(false)|(no)|n|f)$/i.test(col.filter) || /^([1-9]\d*|(true)|(yes)|y|t)$/i.test(col.filter)) {
                            filters.push({
                                filter: /^([1-9]\d*|(true)|(yes)|y|t)$/i.test(col.filter),
                                key: col.key,
                                type: col.type
                            });
                        }else if (col.trueFilter && col.falseFilter && col.filter.toLowerCase() === col.trueFilter || col.filter.toLowerCase() === col.falseFilter.toLowerCase()){
                            filters.push({
                                filter: col.filter.toLowerCase() === col.trueFilter.toLowerCase(),
                                key: col.key,
                                type: col.type
                            });
                        }

                    }else if (col.filter && typeof col.filter === 'string'){
                        filters.push({
                            filter:col.filter.toLowerCase(),
                            key: col.key
                        });
                    }
                });

                // run query
                return _.filter(input, function (item) {
                    return _.all(filters, function (col) {
                        if (!col.key) {
                            return true;
                        } else if (!col.type && _.isObject(prop(item,col.key))) {
                            return _.any(prop(item,col.key), function (v){
                                if (_.isPlainObject(v)){
                                    return _.any(v, function (vv){
                                        return (vv + "").toLowerCase().indexOf(col.filter) > -1;
                                    });
                                }else{
                                    return (prop(item,col.key) + "").toLowerCase().indexOf(col.filter) > -1;
                                }
                            });
                        } else if (!col.type) {
                            return (prop(item,col.key) + "").toLowerCase().indexOf(col.filter) > -1;
                        } else if (col.type === 'date') {
                            var d = moment(prop(item,col.key)).valueOf();
                            return d >= col.filter[0] && d <= col.filter[1];
                        } else if (col.type === 'number') {
                            return prop(item,col.key) >= col.filter[0] && prop(item,col.key) <= col.filter[1];
                        }else if (col.type === 'bool') {
                            return !!prop(item,col.key) === col.filter;
                        }
                    });
                });
            }


        };
    }
    complexFilter.$inject = ["$filter"];

    angular.module('sds-angular-controls').filter('complexFilter', complexFilter);
})();

(function (){
    'use strict';

    function keyFilter (){
        return function (obj, query) {
            var result = {};
            angular.forEach(obj, function (val, key) {
                if (key !== query) {
                    result[key] = val;
                }
            });
            return result;
        };
    }

    angular.module('sds-angular-controls').filter('keyFilter', keyFilter);
})();

(function (){
  'use strict';

  function labelCase (){
    return function (input) {

      if (input === null || input === undefined || input === ''){
          input = ' ';
      }
      input = (input + '').replace(/([A-Z])/g, ' $1');
      return input[0].toUpperCase() + input.slice(1);
    };
  }

  angular.module('sds-angular-controls').filter('labelCase', labelCase);
})();

(function (){
    'use strict';

    function ordinal (){
        var suffixes = ["th", "st", "nd", "rd"];
        return function(input) {
            var v=input%100;
            return input+(suffixes[(v-20)%10]||suffixes[v]||suffixes[0]);
        };
    }

    angular.module('sds-angular-controls').filter('ordinal', ordinal);
})();

(function (){
    'use strict';

    function page (){
        return function(input, page, size) {
            if (!input || !input.length){
                return [];
            }

            page = parseInt(page || 0, 10) || 0;
            size = parseInt(size || 0, 10);
            if (!size){
                size = 25;
            }
            return input.slice(page * size, (page+1) * size);
        };
    }

    angular.module('sds-angular-controls').filter('page', page);
})();

(function (){
    'use strict';

    function sanitize ($sanitize){
        return function (input) {

            if (input === null || input === undefined || input === ''){
                input = ' ';
            }
            return $sanitize(input);
        };
    }
    sanitize.$inject = ["$sanitize"];

    angular.module('sds-angular-controls').filter('sanitize', sanitize);
})();

(function (){
    'use strict';

    function unsafe ($sce) { return $sce.trustAsHtml; }
    unsafe.$inject = ["$sce"];

    angular.module('sds-angular-controls').filter('unsafe', unsafe);
})();

angular.module('currencyMask', []).directive('currencyMask', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelController) {
            // Run formatting on keyup
            var numberWithCommas = function(value, addExtraZero) {
                if (addExtraZero == undefined) {
                    addExtraZero = false;
                }
                value = value.toString();
                var isNegative = (value[0] === '-');
                value = value.replace(/[^0-9\.]/g, "");
                var parts = value.split('.');
                parts[0] = parts[0].replace(/\d{1,3}(?=(\d{3})+(?!\d))/g, "$&,");
                if (parts[1] && parts[1].length > 2) {
                    parts[1] = parts[1].substring(0, 2);
                }

                if (addExtraZero && parts[1] && (parts[1].length === 1)) {
                    parts[1] = parts[1] + "0"
                }else if (addExtraZero && !parts[1]){
                    parts[1] = '00';
                }
                return (isNegative? '-' : '') + '$' + parts[0] + '.' + parts[1];
            };
            var applyFormatting = function() {
                var value = element.val();
                var original = value;
                if (!value || value.length == 0) { return }
                value = numberWithCommas(value, true);
                if (value != original) {
                    element.val(value);
                    element.triggerHandler('input')
                }
            };
            element.bind('keypress', function(e) {
                var verified = (e.which == 8 || e.which == undefined || e.which == 0) ? null : String.fromCharCode(e.which).match(/[^$,-.0-9]/);
                if (verified) {e.preventDefault();}
            }).bind('blur', applyFormatting);
            ngModelController.$parsers.push(function(value) {
                if (!value || value.length == 0) {
                    return value;
                }
                value = value.toString();
                value = value.replace(/[^0-9\.\-]/g, "");
                return value;
            });
            ngModelController.$formatters.push(function(value) {
                if (!value || value.length == 0) {
                    return value;
                }
                value = numberWithCommas(value, true);
                return value;
            });
        }
    };
});

//(function () {
//    'use strict';
//    function autoNumeric (){
//        var options = {};
//        return {
//            require: '?ngModel', // Require ng-model in the element attribute for watching changes.
//            restrict: 'A',
//            compile: function (tElm, tAttrs) {
//                //ref: https://gist.github.com/kwokhou/5964296
//                //autonumeric: https://github.com/BobKnothe/autoNumeric
//
//                var isTextInput = tElm.is('input:text');
//
//                return function (scope, elm, attrs, controller) {
//                    // Get instance-specific options.
//                    var opts = angular.extend({}, options, scope.$eval(attrs.autoNumeric));
//
//                    // Helper method to update autoNumeric with new value.
//                    var updateElement = function (element, newVal) {
//                        // Only set value if value is numeric
//                        if ($.isNumeric(newVal)) {
//                            element.autoNumeric('set', newVal);
//                        }
//                    };
//
//                    // Initialize element as autoNumeric with options.
//                    elm.autoNumeric(opts);
//
//                    // if element has controller, wire it (only for <input type="text" />)
//                    if (controller && isTextInput) {
//                        // watch for external changes to model and re-render element
//                        scope.$watch(tAttrs.ngModel, function (current, old) {
//                            controller.$render();
//                        });
//                        // render element as autoNumeric
//                        controller.$render = function () {
//                            updateElement(elm, controller.$viewValue);
//                        };
//                        // Detect changes on element and update model.
//                        elm.on('change', function (e) {
//                            scope.$apply(function () {
//                                controller.$setViewValue(elm.autoNumeric('get'));
//                            });
//                        });
//                    }
//                    else {
//                        // Listen for changes to value changes and re-render element.
//                        // Useful when binding to a readonly input field.
//                        if (isTextInput) {
//                            attrs.$observe('value', function (val) {
//                                updateElement(elm, val);
//                            });
//                        }
//                    }
//                };
//            } // compile
//        };
//    }
//
//    angular.module('sds-angular-controls').directive('autoNumeric',autoNumeric);
//})();

(function () {
    'use strict';
    function formAutocomplete ($timeout) {
        return{
            restrict: 'EA',
            require: '^formField',
            replace: true,
            scope: {
                items           : '=',
                groups          : '=?',
                itemKey         : '@?',
                itemValue       : '@?',
                itemSort        : '@?',
                itemGroupKey    : '@?',
                itemGroupValue  : '@?',
                dropdownDirection:'@?',
                allowCustom     : '=?',
                style           : '@?',
                layoutCss       : '@?' //default col-md-6
            },
            templateUrl: 'sds-angular-controls/form-directives/form-autocomplete.html',

            link: function (scope, element, attr, container) {
                var input = element.find('select');
                scope.container = container.$scope;
                scope.innerItems = [];
                //// hack to force reloading options
                scope.$watch("items", function(newVal, oldVal){
                    if(scope.items && !_.isArray(scope.items)){
                        scope.innerItems = convertToArray();
                    }else{
                        var i = 0;
                        scope.innerItems = _.map(scope.items, function (v){
                            v.__sort = i++;
                            return v;
                        });
                    }

                    if(newVal && newVal !== oldVal){
                        scope.reload = true;
                        $timeout(function (){
                            scope.reload = false;
                        });
                    }
                });

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

                function convertToArray(){
                    var i = 0;
                    var items = _.reduce(scope.items, function(result, item, key) {
                        //result[item["item-key"]] = item["item-value"];
                        result.push({
                            "itemKey" : key,
                            "itemValue": item,
                            "__sort": i++
                        });

                        return result;
                    }, []);
                    scope.options.valueField = "itemKey";
                    scope.options.labelField = "itemValue";
                    scope.options.searchField = ["itemValue"];
                    scope.reload = true;
                    $timeout(function (){
                        scope.reload = false;
                    });

                    return items;
                }

                scope.$watch("container.isReadonly", function(newVal){
                    if(newVal) {
                        if (scope.container.record && scope.container.record[scope.container.field]) {

                            var value = scope.innerItems[scope.container.record[scope.container.field]];
                            //if using itemKey/itemValue -we need to find it in the array vs. hash:
                            if(scope.itemValue && scope.itemKey){
                                var arrayItem = _.find(scope.innerItems, function(item){
                                    return item[scope.itemKey] === scope.container.record[scope.container.field];
                                });
                                value = arrayItem[scope.itemValue];
                            }
                            scope.readOnlyModel = value;
                        }
                    }
                });

                var options = {
                    plugins: ['dropdown_direction'],
                    dropdownDirection: scope.dropdownDirection || 'auto',
                    valueField: scope.itemKey,
                    labelField: scope.itemValue,
                    searchField: [scope.itemValue],
                    sortField:  scope.itemSort || '__sort',
                    maxOptions: 1200
                };



                if (scope.allowCustom){
                    options.persist = false;
                    options.create = true;
                }

                if (scope.itemGroupKey && _.isArray(scope.groups)){
                    options.optgroups =  scope.groups;
                    options.optgroupField = scope.itemGroupKey;
                    options.optgroupValueField = scope.itemGroupKey;
                    options.optgroupLabelField = scope.itemGroupValue;

                    scope.$watch('groups', function (val, old){
                        if (val !== old){
                            scope.options.optgroups =  scope.groups;
                            scope.reload = true;
                            $timeout(function (){
                                scope.reload = false;
                            });
                        }
                    });
                }

                scope.options = options;
            }
        }
    }
    formAutocomplete.$inject = ["$timeout"];

    angular.module('sds-angular-controls').directive('formAutocomplete', formAutocomplete);

})();

(function () {
    'use strict';
    function formButton ($q) {
        return{
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: {
                buttonClass: '@?',
                action: '&'
            },
            template: '<a href="" class="btn {{buttonClass}} {{isDisabled}}" ng-click="doPromise($event)" ng-transclude></a>',
            link: function($scope, element, attrs){
                $scope.buttonClass = $scope.buttonClass || 'btn-default';
                $scope.isDisabled = '';
                $scope.doPromise = function ($event){
                    if ($scope.isDisabled){
                        return;
                    }
                    $scope.isDisabled = 'disabled';
                    $q.when($scope.action($event)).then(function (){
                        $scope.isDisabled = '';
                    }, function (){
                        $scope.isDisabled = '';
                    });
                }
            }
        }
    }
    formButton.$inject = ["$q"];

    angular.module('sds-angular-controls').directive('formButton', formButton)

})();


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

                    var name = attr.name || attr.ngModel.substr(attr.ngModel.lastIndexOf('.')+1);;
                    formField.$scope.field = name;

                }
            }
        }
    }
    formControl.$inject = ["$timeout"];

    angular.module('sds-angular-controls').directive('formControl', formControl)

})();

(function () {
    'use strict';
    function formCurrencyInput ($timeout) {
        return{
            restrict: 'EA',
            require: '^form-field',
            replace: true,
            scope: {
                placeholder     : '@?',
                rightLabel      : '@?',
                mask            : '@?',
                max             : '@?',
                min             : '@?',
                style           : '@?',
                layoutCss       : '@?' //default col-md-6
            },
            templateUrl: 'sds-angular-controls/form-directives/form-currency-input.html',
            link: function (scope, element, attr, container) {
                var input = element.find('input');
                scope.container = container.$scope;

                // one-time bindings:
                switch(container.$scope.layout){
                    case "horizontal":
                        scope.layoutCss = scope.layoutCss || "col-md-6";
                        break;
                    default: //stacked
                        scope.layoutCss = scope.layoutCss || "";
                }

                if (scope.min){
                    container.$scope.min = scope.min;
                }
                if (scope.max){
                    container.$scope.max = scope.max;
                }
                if (container.$scope.isAutofocus){
                    $timeout(function (){element.find('input').focus(); });
                }

                //$timeout(function (){
                //    var isIntegerStep = false;
                //    if (scope.type === "number"){
                //        element.find(".inputField").on('keydown', function (e) {
                //            var key = e.which || e.keyCode;
                //            console.log(key, e);
                //
                //            return e.metaKey || e.ctrlKey || (!e.shiftKey &&
                //                    // numbers
                //                key >= 48 && key <= 57 ||
                //                    // Numeric keypad
                //                key >= 96 && key <= 105 ||
                //                    // Minus
                //                key == 109 || key == 189 ||
                //                    // decimal points
                //                (!isIntegerStep && key == 190 || key == 110) ||
                //                    // Backspace and Tab and Enter
                //                key == 8 || key == 9 || key == 13 ||
                //                    // Home and End
                //                key == 35 || key == 36 ||
                //                    // left and right arrows
                //                key == 37 || key == 39 ||
                //                    // Del and Ins
                //                key == 46 || key == 45);
                //
                //
                //        });
                //    }
                //});
            }
        }
    }
    formCurrencyInput.$inject = ["$timeout"];

    angular.module('sds-angular-controls').directive('formCurrencyInput', formCurrencyInput);
})();

(function () {
    'use strict';
    function formDatePicker ($timeout, $log) {
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
            templateUrl: 'sds-angular-controls/form-directives/form-date-picker.html',

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
                        if(scope.container.record[scope.container.field]) {
                            scope.readOnlyModel = moment(scope.container.record[scope.container.field]).format(scope.dateFormat.toUpperCase());
                        }
                    }
                });

                if (scope.max) {
                    container.$scope.max = moment.utc(scope.max).format(scope.dateFormat.toUpperCase());
                }
                if (scope.min) {
                    container.$scope.min = moment.utc(scope.min).format(scope.dateFormat.toUpperCase());
                }
            }
        }
    }
    formDatePicker.$inject = ["$timeout", "$log"];

    function datepickerPopup (){
        return {
            restrict: 'EAC',
            require: 'ngModel',
            link: function(scope, element, attr, controller) {
                //remove the default formatter from the input directive to prevent conflict
                controller.$formatters.shift();
            }
        }
    }

    angular.module('sds-angular-controls').directive('formDatePicker', formDatePicker).directive('datepickerPopup', datepickerPopup);
})();

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
    formDateTimePicker.$inject = ["$timeout"];

    angular.module('sds-angular-controls').directive('formDateTimePicker', formDateTimePicker);
})();

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
            controller: ["$scope", function ($scope){
                this.$scope = $scope;
            }],
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
                }
            }

        }
    }
    formField.$inject = ["$filter", "$timeout"];

    angular.module('sds-angular-controls').directive('formField', formField);
})();

(function () {
    'use strict';
    function formInput ($timeout) {
        return{
            restrict: 'E',
            require: '^form-field',
            replace: true,
            scope: {
                placeholder     : '@?',
                rightLabel      : '@?',
                mask            : '@?',
                max             : '@?',
                min             : '@?',
                maxlength       : '@?',
                minlength       : '@?',
                style           : '@?',
                layoutCss       : '@?' //default col-md-6
            },
            templateUrl: 'sds-angular-controls/form-directives/form-input.html',
            link: function (scope, element, attr, container) {
                var input = element.find('input');
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
                    $timeout(function (){element.find('input').focus();});
                }
                if (scope.min){
                    container.$scope.min = scope.min;
                }
                if (scope.max){
                    container.$scope.max = scope.max;
                }
                if (attr.pattern){
                    input.attr('pattern', attr.pattern);
                }

                scope.step = attr.step || "any";
                scope.type = attr.type || "text";

                $timeout(function (){
                    var isIntegerStep = scope.step.match(/^\d+$/);
                    if (scope.type === "number"){
                        element.find(".inputField").on('keydown', function (e) {
                            var key = e.which || e.keyCode;

                            return e.metaKey || e.ctrlKey || (!e.shiftKey &&
                                // numbers
                            key >= 48 && key <= 57 ||
                                // Numeric keypad
                            key >= 96 && key <= 105 ||
                                // Minus
                            key == 109 || key == 189 ||
                                // decimal points
                            (!isIntegerStep && key == 190 || key == 110) ||
                                // Backspace and Tab and Enter
                            key == 8 || key == 9 || key == 13 ||
                                // Home and End
                            key == 35 || key == 36 ||
                                // left and right arrows
                            key == 37 || key == 39 ||
                                // Del and Ins
                            key == 46 || key == 45);


                        });
                    }
                });
            }
        }
    }
    formInput.$inject = ["$timeout"];

    angular.module('sds-angular-controls').directive('formInput', formInput)

})();

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
    formMultiSelect.$inject = ["$timeout"];

    angular.module('sds-angular-controls').directive('formMultiSelect', formMultiSelect);
})();

(function () {
    'use strict';
    function formSelect ($timeout) {
        return{
            restrict: 'EA',
            require: '^formField',
            replace: true,
            scope: {
                items           : '=',
                itemKey         : '@?',
                itemValue       : '@?',
                style           : '@?',
                layoutCss       : '@?' //default col-md-6
            },
            templateUrl: 'sds-angular-controls/form-directives/form-select.html',

            link: function (scope, element, attr, container) {
                var input = element.find('select');
                scope.container = container.$scope;
                scope.innerItems = {};

                scope.$watch("items", function(newVal, oldVal){

                    if(scope.items && _.isArray(scope.items)) {
                        if (scope.itemKey && scope.itemValue) {
                            scope.innerItems = convertToHash(scope.items, scope.itemKey, scope.itemValue);
                        }
                    }else{
                        scope.innerItems = scope.items;
                    }
                });

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

                            var value = scope.innerItems[scope.container.record[scope.container.field]];

                            scope.readOnlyModel = value;
                        }
                    }
                });

                scope.orderHash = function(obj){
                    if (!obj) {
                        return [];
                    }
                    return obj.orderedKeys || Object.keys(obj);
                };

                function getChild (obj, key){
                    var arr = key.split(".");
                    while(arr.length && (obj = obj[arr.shift()])); // jshint ignore:line
                    return obj;
                }

                function convertToHash(items, itemKey, itemValue){
                    var OrderedDictionary = function (){};
                    OrderedDictionary.prototype.orderedKeys = [];
                    return _.reduce(items, function (result, item) {
                        var key = getChild(item, itemKey);
                        var val = getChild(item, itemValue);
                        result[key] = val;

                        // set the ordered keys value
                        result.orderedKeys.push(key);
                        return result;
                    }, new OrderedDictionary());
                }

                // If a key is numeric, javascript converts it to a string when using a foreach. This
                // tests if the key is numeric, and if so converts it back.
                scope.convertType = function (item){
                    //if the record is a string type then keep the item as a string
                    if(scope.record && scope.record[scope.field]) {
                        if (typeof scope.record[scope.field] === 'string') {
                            return item.toString();
                        }
                    }

                    //if it's a number - make sure the values are numbers
                    if (item && !isNaN(item)) {
                        return parseInt(item, 10);
                    } else {
                        return item;
                    }
                };


            }
        }
    }
    formSelect.$inject = ["$timeout"];

    angular.module('sds-angular-controls').directive('formSelect', formSelect);
})();

(function () {
    'use strict';
    function formTextArea ($timeout) {
        return{
            restrict: 'EA',
            replace: true,
            require: '^formField',
            scope: {
                style           : '@?',
                layoutCss       : '@?', //default col-md-6
                maxlength       : '@?',
                minlength       : '@?'
            },
            templateUrl: 'sds-angular-controls/form-directives/form-text-area.html',
            link: function (scope, element, attr, container) {
                var input = element.find('textarea');
                scope.container = container.$scope;

                switch(container.$scope.layout){
                    case "horizontal":
                        scope.layoutCss = scope.layoutCss || "col-md-6";
                        break;
                    default: //stacked
                        scope.layoutCss = scope.layoutCss || "";
                }

                if (container.$scope.isAutofocus){
                    $timeout(function (){element.find('textarea').focus(); });
                }
            }
        }
    }
    formTextArea.$inject = ["$timeout"];

    angular.module('sds-angular-controls').directive('formTextArea', formTextArea);
})();

(function () {
    'use strict';
    function formTextToggle ($timeout) {
        return{
            restrict: 'EA',
            replace: true,
            require: '^form-field',
            scope: {
                placeholder     : '@?',
                toggleField     : '@?', //one-way binding
                toggleSwitchType: '@?',
                onLabel         : '@?',
                offLabel        : '@?',
                style           : '@?',
                layoutCss       : '@?' //default col-md-6
            },
            templateUrl: 'sds-angular-controls/form-directives/form-text-toggle.html',
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

                scope.type = attr.type || "text";

                scope.toggleSwitchType = scope.toggleSwitchType || "primary";
                scope.onLabel = scope.onLabel   || "Yes";
                scope.offLabel = scope.offLabel || "No";
            }
        }
    }
    formTextToggle.$inject = ["$timeout"];

    angular.module('sds-angular-controls').directive('formTextToggle', formTextToggle);
})();

(function () {
    'use strict';
    function formTimePicker ($timeout) {
        return{
            restrict: 'E',
            replace: true,
            require: '^form-field',
            scope: {
                layoutCss       : '@?' //default col-md-6
            },
            templateUrl: 'sds-angular-controls/form-directives/form-time-picker.html',
            link: function (scope, element, attr, container) {
                scope.container = container.$scope;

                switch(container.$scope.layout){
                    case "horizontal":
                        scope.layoutCss = scope.layoutCss || "col-md-6";
                        break;
                    default: //stacked
                        scope.layoutCss = scope.layoutCss || "";
                }
                scope.$watch('container.record[container.field]', function (val){
                    if (typeof val === 'string'){
                        container.$scope.record[container.$scope.field] = moment.utc(container.$scope.record[container.$scope.field]).toDate();
                    }
                });

                scope.$watch("container.isReadonly", function(newVal){
                    if(newVal) {
                        scope.readOnlyModel = moment(scope.container.record[scope.container.field]).format('h:mm a');
                    }
                });
            }
        }
    }
    formTimePicker.$inject = ["$timeout"];

    angular.module('sds-angular-controls').directive('formTimePicker', formTimePicker);
})();

(function () {
    'use strict';
    function formToggle ($filter) {
        return{
            restrict: 'EA',
            replace: true,
            require: '^form-field',
            scope: {
                toggleSwitchType: '@?',
                onLabel         : '@?',
                offLabel        : '@?',
                style           : '@?',
                layoutCss       : '@?' //default col-md-6
            },
            templateUrl: 'sds-angular-controls/form-directives/form-toggle.html',
            link: function (scope, element, attr, container) {
                scope.container = container.$scope;

                switch(container.$scope.layout){
                    case "horizontal":
                        scope.layoutCss = scope.layoutCss || "col-md-6";
                        break;
                    default: //stacked
                        scope.layoutCss = scope.layoutCss || "";
                }

                scope.toggleSwitchType = scope.toggleSwitchType || "primary";
                scope.onLabel = scope.onLabel   || "Yes";
                scope.offLabel = scope.offLabel || "No";
            }
        }
    }
    formToggle.$inject = ["$filter"];

    angular.module('sds-angular-controls').directive('formToggle', formToggle);
})();

(function () {
  'use strict';
  function maskInput (){
    return {
      restrict: 'A',
      scope:{
        maskInput: '@'
      },
      link: function (scope, element) {
        if(scope.maskInput) {
          $(element).mask(scope.maskInput);
        }
      }
    };
  }

  angular.module('sds-angular-controls').directive('maskInput', maskInput);
})();

(function (){
    'use strict';

    function phoneNumber (){
        return function (tel) {
            if (!tel) { return ''; }

            var value = tel.toString().trim().replace(/^\+/, '');

            if (value.match(/[^0-9]/)) {
                return tel;
            }

            var country, city, number;

            switch (value.length) {
                case 10: // +1PPP####### -> C (PPP) ###-####
                    country = 1;
                    city = value.slice(0, 3);
                    number = value.slice(3);
                    break;

                case 11: // +CPPP####### -> CCC (PP) ###-####
                    country = value[0];
                    city = value.slice(1, 4);
                    number = value.slice(4);
                    break;

                case 12: // +CCCPP####### -> CCC (PP) ###-####
                    country = value.slice(0, 3);
                    city = value.slice(3, 5);
                    number = value.slice(5);
                    break;

                default:
                    return tel;
            }

            if (country === 1) {
                country = "";
            }

            number = number.slice(0, 3) + '-' + number.slice(3);

            return (country + " (" + city + ") " + number).trim();
        };
    }

    angular.module('sds-angular-controls').filter('phoneNumber', phoneNumber);
})();

(function () {
    angular.module('selectize-ng', [])
        .directive('selectize', function () {
            'use strict';

            return {
                restrict: 'A',
                require: 'ngModel',
                scope: {
                    selectize: '&',
                    options: '&',
                    defaults: '&',
                    selecteditems: '='
                },
                link: function (scope, element, attrs, ngModel) {

                    var changing, runOnce, options, defaultValues, selectize, invalidValues = [];

                    runOnce = false;

                    // Default options
                    options = angular.extend({
                        delimiter: ',',
                        persist: true,
                        mode: (element[0].tagName === 'SELECT') ? 'single' : 'multi'
                    }, scope.selectize() || {});

                    // Activate the widget
                    selectize = element.selectize(options)[0].selectize;

                    selectize.on('change', function () {
                        setModelValue(selectize.getValue());
                    });

                    function setModelValue(value) {
                        if (changing) {
                            if (attrs.selecteditems) {
                                var selected = [];
                                var values = parseValues(value);
                                angular.forEach(values, function (i) {
                                    selected.push(selectize.options[i]);
                                });
                                scope.$apply(function () {
                                    scope.selecteditems = selected;
                                });
                            }
                            return;
                        }

                        scope.$parent.$apply(function () {
                            ngModel.$setViewValue(value);
                            selectize.$control.toggleClass('ng-valid', ngModel.$valid);
                            selectize.$control.toggleClass('ng-invalid', ngModel.$invalid);
                            selectize.$control.toggleClass('ng-dirty', ngModel.$dirty);
                            selectize.$control.toggleClass('ng-pristine', ngModel.$pristine);
                        });


                        if (options.mode === 'single') {
                            selectize.blur();
                        }
                    }

                    // Normalize the model value to an array
                    function parseValues(value) {
                        if (angular.isArray(value)) {
                            return value;
                        }
                        if (!value) {
                            return [];
                        }
                        return String(value).split(options.delimiter);
                    }

                    // Non-strict indexOf
                    function indexOfLike(arr, val) {
                        for (var i = 0; i < arr.length; i++) {
                            if (arr[i] == val) {
                                return i;
                            }
                        }
                        return -1;
                    }

                    // Boolean wrapper to indexOfLike
                    function contains(arr, val) {
                        return indexOfLike(arr, val) !== -1;
                    }

                    // Store invalid items for late-loading options
                    function storeInvalidValues(values, resultValues) {
                        values.map(function (val) {
                            if (!(contains(resultValues, val) || contains(invalidValues, val))) {
                                invalidValues.push(val);
                            }
                        });
                    }

                    function restoreInvalidValues(newOptions, values) {
                        var i, index;
                        for (i = 0; i < newOptions.length; i++) {
                            index = indexOfLike(invalidValues, newOptions[i][selectize.settings.valueField]);
                            if (index !== -1) {
                                values.push(newOptions[i][selectize.settings.valueField]);
                                invalidValues.splice(index, 1);
                            }
                        }
                    }

                    function setSelectizeValue(value, old) {
                        if (!value) {
                            setTimeout(function () {
                                selectize.clear();
                                return;
                            });
                        }
                        var values = parseValues(value);
                        if (changing || values === parseValues(selectize.getValue())) {
                            return;
                        }
                        changing = true;
                        if (options.mode === 'single' && value) {
                            setTimeout(function () {
                                selectize.setValue(value);
                                changing = false;
                            });
                        }
                        else if (options.mode === 'multi' && value) {
                            setTimeout(function () {
                                selectize.setValue(values);
                                changing = false;
                                storeInvalidValues(values, parseValues(selectize.getValue()));
                            });
                        }else if(!value){
                            changing = false;
                        }

                        selectize.$control.toggleClass('ng-valid', ngModel.$valid);
                        selectize.$control.toggleClass('ng-invalid', ngModel.$invalid);
                        selectize.$control.toggleClass('ng-dirty', ngModel.$dirty);
                        selectize.$control.toggleClass('ng-pristine', ngModel.$pristine);
                    }

                    function setSelectizeOptions(newOptions) {
                        if (!newOptions) {
                            return;
                        }

                        var values;

                        if (attrs.defaults && !runOnce) {
                            changing = false;
                            values = parseValues(scope.defaults());
                            runOnce = !runOnce;
                        } else if (!attrs.defaults) {
                            values = parseValues(ngModel.$viewValue);
                        }

                        selectize.clearOptions();
                        selectize.addOption(newOptions);
                        selectize.refreshOptions(false);
                        if (options.mode === 'multi' && newOptions && values) {
                            restoreInvalidValues(newOptions, values);
                        }
                        setSelectizeValue(values);
                    }

                    scope.$parent.$watch(attrs.ngModel, setSelectizeValue);

                    if (attrs.options) {
                        scope.$parent.$watchCollection(attrs.options, setSelectizeOptions);
                    }

                    scope.$on('$destroy', function () {
                        selectize.destroy();
                    });
                }
            };
        });
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    Selectize.define('dropdown_direction', function (options) {
        var self = this;

        /**
         * Calculates and applies the appropriate position of the dropdown.
         *
         * Supports dropdownDirection up, down and auto. In case menu can't be fitted it's
         * height is limited to don't fall out of display.
         */
        this.positionDropdown = (function () {
            return function () {
                var $control = this.$control;
                var $dropdown = this.$dropdown;
                var p = getPositions();

                // direction
                var direction = getDropdownDirection(p);
                if (direction === 'up') {
                    $dropdown.addClass('direction-up').removeClass('direction-down');
                } else {
                    $dropdown.addClass('direction-down').removeClass('direction-up');
                }
                $control.attr('data-dropdown-direction', direction);

                // position
                var isParentBody = this.settings.dropdownParent === 'body';
                var offset = isParentBody ? $control.offset() : $control.position();
                var fittedHeight;

                switch (direction) {
                    case 'up':
                        offset.top -= p.dropdown.height;
                        if (p.dropdown.height > p.control.above) {
                            fittedHeight = p.control.above - 15;
                        }
                        break;

                    case 'down':
                        offset.top += p.control.height;
                        if (p.dropdown.height > p.control.below) {
                            fittedHeight = p.control.below - 15;
                        }
                        break;
                }

                if (fittedHeight) {
                    this.$dropdown_content.css({'max-height': fittedHeight});
                }

                this.$dropdown.css({
                    width: $control.outerWidth(),
                    top: offset.top,
                    left: offset.left
                });
            };
        })();

        /**
         * Gets direction to display dropdown in. Either up or down.
         */
        function getDropdownDirection(positions) {
            var direction = self.settings.dropdownDirection;

            if (direction === 'auto') {
                // down if dropdown fits
                if (positions.control.below > positions.dropdown.height) {
                    direction = 'down';
                }
                // otherwise direction with most space
                else {
                    direction = (positions.control.above > positions.control.below) ? 'up' : 'down';
                }
            }

            return direction;
        }

        /**
         * Get position information for the control and dropdown element.
         */
        function getPositions() {
            var $control = self.$control;
            var $window = $(window);

            var control_height = $control.outerHeight(false);
            var control_above = $control.offset().top - $window.scrollTop();
            var control_below = $window.height() - control_above - control_height;

            var dropdown_height = self.$dropdown.outerHeight(false);

            return {
                control: {
                    height: control_height,
                    above: control_above,
                    below: control_below
                },
                dropdown: {
                    height: dropdown_height
                }
            };
        }
    });

})();

(function () {
    'use strict';

    function dbApiVelocity ($http, $rootScope) {
        return{
            restrict: 'E',
            require: '^dbGrid',
            scope:{
                api: '@',
                postParams: '='
            },
            link: function (scope, element, attr, dbGrid) {

                if (attr.postParams){
                    scope.$watch('postParams', function (val){
                        if(val) {
                            dbGrid.refresh(true);
                        }
                    });
                }

                function capitalize (str){
                    return str.charAt(0).toUpperCase() + str.slice(1);
                }

                function isNumeric (obj){
                   return (obj - parseFloat( obj ) + 1) >= 0;
                }

                function isInt (obj){
                    return (obj - parseInt( obj )) === 0;
                }

                function getData(filter, sortKey, sortAsc, currentPage, pageSize, cols){
                    var query = {
                        page: currentPage+1,
                        pageSize: pageSize,
                        sort: [],
                        filter: createFilters(filter, cols)
                    };
                    if (sortKey !== null){
                        query.sort.push({
                            field: capitalize(sortKey),
                            direction: sortAsc ? '' : 'desc'
                        });
                    }
                    _.merge(query, scope.postParams, function(a, b) {
                        if (_.isArray(a)) {
                            return a.concat(b);
                        }
                    });

                    scope.query = query;

                    $rootScope.$broadcast('db-api:start', query);
                    dbGrid.setWaiting(true);
                    return $http.post(scope.api, query).then(function (response) {
                        $rootScope.$broadcast('db-api:complete', response.data);
                        dbGrid.setTotal(response.data.total);
                        dbGrid.setWaiting(false);
                        return response.data.tableData;
                    }, function (){
                        dbGrid.setWaiting(false);
                        $rootScope.$broadcast('db-api:complete');
                    });
                }

                function createFilters (filter, cols){
                    var result = {filters: []};
                    var dateRangeRegex = /^(\s*(\d+[-/]){2}[^-]*)-(\s*(\d+[-/]){2}[^-]*)$/;
                    var dateRegex = /^(\s*(\d+[-/]){2}[^-]*)$/;

                    if (typeof filter === 'object'){
                        var n;
                        result.logic = 'and';
                        result.filters = _.reduce(cols, function (r, item){
                            if (item.key && item.filter && item.type === 'number' && item.filter[0] === '-'){
                                n = item.filter.slice(1);
                                if (isNumeric(n)) {
                                    r.push({
                                        fieldType: 'decimal',
                                        fieldOperator: 'lt',
                                        fieldValue: parseFloat(n),
                                        field: capitalize(item.key)
                                    });
                                }

                            }else if (item.key && item.filter && item.type === 'date' && item.filter[0] === '-'){
                                n = item.filter.slice(1);
                                if (dateRegex.test(n) && moment(n).isValid()) {
                                    r.push({
                                        fieldType: 'datetime',
                                        fieldOperator: 'lt',
                                        fieldValue: moment(n).utcOffset(0).format('MM/DD/YYYY HH:mm a'),
                                        field: capitalize(item.key)
                                    });
                                }
                            }else if (item.key && item.filter && item.type === 'date' && item.filter[item.filter.length-1] === '-'){
                                n = item.filter.slice(0, -1);
                                if (dateRegex.test(n) && moment(n).isValid()) {
                                    r.push({
                                        fieldType: 'datetime',
                                        fieldOperator: 'gt',
                                        fieldValue: moment(n).utcOffset(0).format('MM/DD/YYYY HH:mm a'),
                                        field: capitalize(item.key)
                                    });
                                }
                            }else if (item.key && item.filter && item.type === 'number' && item.filter.indexOf('-') > 0){
                                n = item.filter.split('-');
                                if(!n[0] && n[1]){
                                    n.slice(0,1);
                                    n[0] *= -1;
                                }
                                if(!n[1] && n[2]){
                                    n.slice(1,1);
                                    n[1] *= -1;
                                }
                                if (isNumeric(n[0]) && isNumeric(n[1])) {
                                    r.push({
                                        fieldType: 'decimal',
                                        fieldOperator: 'gte',
                                        fieldValue: parseFloat(n[0]),
                                        field: capitalize(item.key)
                                    });
                                    r.push({
                                        fieldType: 'decimal',
                                        fieldOperator: 'lte',
                                        fieldValue: parseFloat(n[1]),
                                        field: capitalize(item.key)
                                    });
                                }

                            }else if (item.key && item.filter && item.type === 'date' && dateRangeRegex.test(item.filter)){
                                n = dateRangeRegex.exec(item.filter);

                                if (moment(n[1]).isValid() && moment(n[3]).isValid()) {
                                    r.push({
                                        fieldType: 'datetime',
                                        fieldOperator: 'gte',
                                        fieldValue: moment(n[1]).utcOffset(0).format('MM/DD/YYYY HH:mm a'),
                                        field: capitalize(item.key)
                                    });
                                    r.push({
                                        fieldType: 'datetime',
                                        fieldOperator: 'lte',
                                        fieldValue: moment(n[3]).endOf('day').utcOffset(0).format('MM/DD/YYYY HH:mm a'),
                                        field: capitalize(item.key)
                                    });
                                }
                            }else if (item.key && item.filter && item.type === 'number'){
                                if (isNumeric(item.filter)) {
                                    r.push({
                                        fieldType: 'decimal',
                                        fieldOperator: 'eq',
                                        fieldValue: parseFloat(item.filter),
                                        field: capitalize(item.key)
                                    });
                                }
                            }else if (item.key && item.filter && item.type === 'int'){
                                if (isInt(item.filter)) {
                                    r.push({
                                        fieldType: 'int',
                                        fieldOperator: 'eq',
                                        fieldValue: parseInt(item.filter),
                                        field: capitalize(item.key)
                                    });
                                }
                            }else if (item.key && item.filter && item.type === 'bool'){
                                if (/^(0|(false)|(no)|n|f)$/i.test(item.filter) || /^([1-9]\d*|(true)|(yes)|y|t)$/i.test(item.filter)) {
                                    r.push({
                                        fieldType: 'bool',
                                        fieldOperator: 'eq',
                                        fieldValue: /^([1-9]\d*|(true)|(yes)|y|t)$/i.test(item.filter),
                                        field: capitalize(item.key)
                                    });
                                }else if (item.trueFilter && item.falseFilter && item.filter.toLowerCase() === item.trueFilter || item.filter.toLowerCase() === item.falseFilter.toLowerCase()){
                                    r.push({
                                        fieldType: 'bool',
                                        fieldOperator: 'eq',
                                        fieldValue: item.filter.toLowerCase() === item.trueFilter.toLowerCase(),
                                        field: capitalize(item.key)
                                    });
                                }
                            }else if (item.key && item.filter && item.type === 'date'){
                                if (moment(item.filter).isValid()) {
                                    r.push({
                                        fieldType: 'datetime',
                                        fieldOperator: 'gte',
                                        fieldValue: moment(item.filter).startOf('day').utcOffset(0).format('MM/DD/YYYY HH:mm a'),
                                        field: capitalize(item.key)
                                    });
                                    r.push({
                                        fieldType: 'datetime',
                                        fieldOperator: 'lte',
                                        fieldValue: moment(item.filter).endOf('day').utcOffset(0).format('MM/DD/YYYY HH:mm a'),
                                        field: capitalize(item.key)
                                    });
                                }
                            }else if (item.key && item.filter){
                                if(item.filter.indexOf("eq ") === 0)
                                {
                                    r.push({
                                        fieldType:'string',
                                        fieldOperator:'eq',
                                        fieldValue: item.filter.substring(3,item.filter.length),
                                        field: capitalize(item.key)
                                    });
                                }
                                else {
                                    r.push({
                                        fieldType: 'string',
                                        fieldOperator: 'contains',
                                        fieldValue: item.filter,
                                        field: capitalize(item.key)
                                    });
                                }
                            }

                            return r;
                        }, []);
                    }else if (typeof filter === 'string' && filter){
                        result.logic = 'or';
                        result.filters = _.reduce(cols, function (r, item){
                            if (item.key && item.sortable && item.type === 'number'){
                                if (isNumeric(filter)) {
                                    r.push({
                                        fieldType: 'decimal',
                                        fieldOperator: 'eq',
                                        fieldValue: parseFloat(filter),
                                        field: capitalize(item.key)
                                    });
                                }
                            }else if (item.key && item.sortable && item.type === 'int'){
                                if (isInt(filter)) {
                                    r.push({
                                        fieldType: 'int',
                                        fieldOperator: 'eq',
                                        fieldValue: parseInt(filter),
                                        field: capitalize(item.key)
                                    });
                                }
                            }else if (item.key && item.sortable && item.type === 'bool'){
                                if (/^(0|(false)|(no)|n|f)$/i.test(filter) || /^(1|(true)|(yes)|y|t)$/i.test(filter)) {
                                    r.push({
                                        fieldType: 'bool',
                                        fieldOperator: 'eq',
                                        fieldValue: /^(1|(true)|(yes)|y|t)$/i.test(filter),
                                        field: capitalize(item.key)
                                    });
                                }else if (item.falseFilter && item.trueFilter && filter && (filter.toLowerCase() === item.trueFilter || filter.toLowerCase() === item.falseFilter)){
                                    r.push({
                                        fieldType: 'bool',
                                        fieldOperator: 'eq',
                                        fieldValue: filter.toLowerCase() === item.trueFilter,
                                        field: capitalize(item.key)
                                    });
                                }
                        }else if (item.key && item.sortable && item.type === 'date'){
                                if (dateRegex.test(filter) && moment(filter).isValid()) {
                                    r.push({
                                        fieldType: 'date',
                                        fieldOperator: 'eq',
                                        fieldValue: filter,
                                        field: capitalize(item.key)
                                    });
                                }
                            }else if (item.key && item.sortable){
                                if(filter.indexOf("eq ") === 0)
                                {
                                    r.push({
                                        fieldType:'string',
                                        fieldOperator:'eq',
                                        fieldValue: filter.substring(3,filter.length),
                                        field: capitalize(item.key)
                                    });
                                }
                                else {
                                    r.push({
                                        fieldType: 'string',
                                        fieldOperator: 'contains',
                                        fieldValue: filter,
                                        field: capitalize(item.key)
                                    });
                                }
                            }
                            return r;
                        }, []);
                    }
                    return result;
                }

                dbGrid.setDataSource(getData);
            }

        }
    }
    dbApiVelocity.$inject = ["$http", "$rootScope"];

    angular.module('sds-angular-controls').directive('dbApiVelocity', dbApiVelocity);
})();


(function () {
    'use strict';

    // For internal use. Manually binds a template using a provided template function, with a fallback to $compile.
    // Needs to be lightweight.

    function dbBindCell ($compile, $parse) {
        return{
            restrict: 'A',
            link: function ($scope, $element) {
                if (typeof $scope._col.template === 'function'){
                    $element.append($scope._col.template($scope));
                }else if(!$element.html().trim()){
                    // template must be wrapped in a single tag
                    var html = angular.element('<span>' + $scope._col.template  + '</span>');
                    var compiled = $compile(html) ;
                    $element.append(html);
                    compiled($scope);
                    $element.data('compiled', compiled);
                }

                if ($scope._col.layoutCss){
                  $element.addClass($scope._col.layoutCss);
                }
            }
        };
    }
    dbBindCell.$inject = ["$compile", "$parse"];


    angular.module('sds-angular-controls').directive('dbBindCell', dbBindCell);
})();



(function () {
    'use strict';

    /**
     * A column definition for use in the db-grid
     *
     * <db-grid for="item in items">
     *     <db-col key="name">{{item.name}} is my name.</db-col>
     * </db-grid>
     *
     * @param {string} key      - The key to base sorting and filtering on.
     * @param {string} label    - A custom label. Defaults to key name.
     * @param {string} type     - 'string', 'number', or 'date'. Used for filtering and sorting. Defaults to 'string'.
     * @param {bool}   sortable - Whether or not the column is sortable. Defaults to true.
     * @param {bool}   bind     - Whether to use full binding on the column. True will use full binding, false will use
     *                            once-bound interpolate templates. Defaults to false.
     */
    function dbCol ($interpolate) {
        return{
            restrict: 'E',
            require: '^dbGrid',
            compile:function(tElement){
                var templateText = tElement.html().trim();
                tElement.empty();

                return function ($scope, $element, $attrs, dbGrid) {
                    var templateFunc = null;

                    if (!templateText && $attrs.key){
                        templateText = '{{' + dbGrid.rowName + '.' + $attrs.key + ' | sanitize}}';
                    }
                    if ($attrs.bind === 'true'){
                        templateFunc = templateText;
                    }else{
                        templateText = templateText.replace(/}}/g, ' | sanitize}}');
                        templateFunc = $interpolate(templateText);
                    }

                    var column = {
                        index: $element.prevAll('db-col').length,
                        filter: $attrs.query,
                        width: $attrs.width,
                        layoutCss: $attrs.layoutCss,
                        falseFilter: $attrs.falseFilter,
                        trueFilter: $attrs.trueFilter,
                        key: $attrs.key,
                        label: $attrs.label,
                        sortable:  $attrs.sortable === 'false' ? false : !!$attrs.key,
                        type: $attrs.type,
                        title: $attrs.title,
                        bind: $attrs.bind === 'true',
                        template: templateFunc
                    };

                    dbGrid.addColumn(column);

                    if($attrs.query !== undefined){
                        $attrs.$observe('query', function (val, old){
                           if(val !== old){
                               if (val) {
                                   dbGrid.setAdvanced(true);
                               }
                               column.filter = val;
                               dbGrid.refresh();
                           }
                        });
                    }

                    $scope.$on('$destroy', function() {
                        dbGrid.removeColumn(column);
                    });
                };
            }
        };
    }
    dbCol.$inject = ["$interpolate"];

    angular.module('sds-angular-controls').directive('dbCol', dbCol);
})();

(function () {
    'use strict';

    /**
     * Creates a grid with sorting, paging, filtering, and the ability to add custom data sources.
     * Can contain custom toolbar buttons, a custom data source element, and a list of db-cols.
     *
     * <db-grid for="items in item">
     *     <db-column key="name"></db-column>
     * </db-grid>
     *
     * @param {string}     format    - A label to put next to the count (TODO: make this customizable)
     * @param {string}     layoutCss - A css class to add to the table
     * @param {string}     filter    - One of the options 'none', 'simple' or 'advanced'. Defaults to 'advanced'. Bound once.
     * @param {int}        pageSize  - The page size, defaults to 25. Bound once.
     * @param {expression} for       - Required. Either 'item in items' or (when used with a custom data source) just 'item'
     */
    function dbGrid ($filter, $timeout, $q, $log) {
        return {
            restrict: 'E',
            replace: true,
            transclude:true,
            scope:true,
            templateUrl: 'sds-angular-controls/table-directives/db-grid.html',
            compile: function (tElement, tAttrs){
                var loop = tAttrs.for.split(' ');
                if (loop.length !== 1 && loop[1] !== 'in') {
                    $log.error('Invalid loop');
                    return;
                }

                var row = tElement.find('tbody').children();
                row.attr('ng-repeat', loop[0] + ' in _model.filteredItems');

                var click = tAttrs.rowClick;
                if (click){
                   row.attr('ng-click', click);
                }

                var rowCss = tAttrs.rowCss;
                if (rowCss){
                    row.attr('ng-class', rowCss);
                }
            },
            controller: ["$scope", "$element", "$attrs", function ($scope, $element, $attrs){
                var complexFilter = $filter('complexFilter');
                var orderByFilter = $filter('orderBy');
                var pageFilter = $filter('page');

                $scope._model = {
                    isApi: false,
                    label: $attrs.label,
                    layoutCss: $attrs.layoutCss,
                    currentPage: 1,
                    total: 0,
                    sortAsc: $attrs.sort ? $attrs.sort[0] !== '-' : true,
                    sort: null,
                    filterText: null,
                    showAdvancedFilter: false,
                    pageSize: $attrs.pageSize ? parseInt($attrs.pageSize, 10) : 25,
                    filterType: ($attrs.filter || 'advanced').toLowerCase(),
                    cols: [],
                    items: null,
                    filteredItems: null,
                    getTooltip: getTooltip,
                    getItems: defaultGetItems,
                    toggleSort: toggleSort,
                    clearFilters: clearFilters,
                    getPages: getPages,
                    onEnter: onEnter,
                    refresh: _.debounce(refresh, 100),
                    waiting: false
                };
                $scope.$grid = {
                    refresh: _.debounce(resetRefresh, 100),
                    items: function (){ return $scope._model.filteredItems; },
                    noResetRefreshFlag: false
                };



                var loop = $attrs.for.split(' ');
                this.rowName = loop[0];
                if (loop[2]) {
                    $scope.$watchCollection(loop.slice(2).join(' '), function (items, old) {
                        if ($scope.$grid.noResetRefreshFlag) {
                            $scope.$grid.noResetRefreshFlag = false;
                        }
                        else {
                            $scope._model.currentPage = 1;
                        }
                        $scope._model.filteredItems = null;
                        $scope._model.items = items;
                        $scope._model.refresh();
                    });
                }

                function defaultGetItems (filter, sortKey, sortAsc, page, pageSize, cols){
                    if ($scope._model.items) {
                        var items = complexFilter($scope._model.items, filter);
                        if (sortKey){
                            items = orderByFilter(items, sortKey, !sortAsc);
                        }
                        $scope._model.total = items ? items.length : 0;
                        return $q.when(pageFilter(items, page, pageSize));
                    }else{
                        return $q.when(null);
                    }
                }

                function toggleSort(index){
                    if ($scope._model.sort === index)  {
                        $scope._model.sortAsc = !$scope._model.sortAsc;
                    }else{
                        $scope._model.sort = index;
                    }
                }

                function clearFilters(){
                    _.each($scope._model.cols, function (item){
                       item.filter = '';
                    });
                    $scope._model.refresh();
                }

                function onEnter(){
                    if ($scope._model.items && $scope._model.items.length === 1){
                        $timeout(function (){
                            $element.find('tbody tr a:first').click();
                        });
                    }
                }

                function getTooltip(col){
                    if (col.title){
                        return col.title;
                    }
                    if (col.type === 'bool'   && col.trueFilter          && col.falseFilter) {
                        return 'Filter using ' + col.trueFilter + ' and ' + col.falseFilter;
                    }else if (col.type === 'bool'){
                        return 'Filter using yes, no, true, or false';
                    }else if (col.type){
                        return 'Use a dash (-) to specify a range';
                    }
                }

                function getPages(){

                    var pages = [];
                    for(var i = 1; i <= ($scope._model.total / $scope._model.pageSize) +1; i++){
                        if (i > $scope._model.currentPage - 5 && i < $scope._model.currentPage + 5){
                            pages.push(i);
                        }
                    }

                    return pages;
                }

                function resetRefresh(resetPage){
                    if ($scope.$grid.noResetRefreshFlag || resetPage === false) {
                        $scope.$grid.noResetRefreshFlag = false;
                    }
                    else {
                        $scope._model.currentPage = 1;
                        if ($scope._model.isApi) {
                            $scope._model.filteredItems = null;
                        }
                    }
                    refresh();
                }

                function refresh() {
                    //$timeout(function () {
                        $scope._model.getItems(
                            $scope._model.showAdvancedFilter ? $scope._model.cols : $scope._model.filterText,
                            $scope._model.sort !== null ? $scope._model.cols[$scope._model.sort].key : null,
                            $scope._model.sortAsc,
                            $scope._model.currentPage - 1,
                            $scope._model.pageSize,
                            $scope._model.cols
                        ).then(function (result){
                            $scope._model.filteredItems = result;
                        });
                    //});
                }

                this.addColumn = function (item){
                    var sort = $attrs.sort || '';
                    if (sort[0] === '-' || sort[0] === '+'){
                        sort = sort.slice(1);
                    }

                    if (sort && sort === item.key && $scope._model.sort === null){
                        $scope._model.sort = $scope._model.cols.length;
                    }else if ($scope._model.sort > item.index){
                        $scope._model.sort += 1;
                    }

                    if (item.filter){
                        $scope._model.showAdvancedFilter = true;
                    }
                    $scope._model.cols.splice(item.index, 0, item);
                };

                this.removeColumn = function (item) {
                    var index = $scope._model.cols.indexOf(item);
                    if (index > -1) {
                        $scope._model.cols.splice(index, 1);

                        if ($scope._model.sort >= index){
                            $scope._model.sort -= 1;
                        }
                    }
                };

                this.setDataSource = function (dataSource){
                    $timeout(function(){
                    $scope._model.getItems = dataSource;
                    $scope._model.isApi = true;
                    $scope._model.refresh.cancel();
                    $scope.$grid.refresh.cancel();
                    $scope._model.refresh = _.debounce(refresh, 1000);
                    $scope.$grid.refresh  = _.debounce(resetRefresh, 1000);
                    refresh();
                    });
                };

                this.setTotal = function (total){
                    $scope._model.total = total;
                };

                this.setWaiting = function (waiting){
                    $scope._model.waiting = waiting;
                };

                this.setAdvanced = function (advanced){
                    $scope._model.showAdvancedFilter = advanced;
                };

                this.refresh = function (force){
                    if ($scope._model.items || force){
                        resetRefresh();
                    }
                };

                if($attrs.query !== undefined){
                    $attrs.$observe('query', function (val, old){
                        if(val !== old){
                            if (_.isString(val)){
                                $scope._model.filterText = val;
                            }
                            $scope._model.refresh();
                        }
                    });
                }

                $scope.$watch('_model.currentPage', refresh);
                $scope.$watch('_model.sort',        $scope._model.refresh);
                $scope.$watch('_model.sortAsc',     $scope._model.refresh);


            }]
        };
    }
    dbGrid.$inject = ["$filter", "$timeout", "$q", "$log"];

    angular.module('sds-angular-controls').directive('dbGrid', dbGrid);
})();

(function () {
    'use strict';

    function dbTransclude (){
        return {
            restrict: 'EA',
            link: function($scope, $element, $attrs, controller, $transclude) {
                $transclude(function(clone, scope) {
                    $element.empty();
                    scope.$grid = $scope.$grid;
                    $element.append(clone);
                });
            }
        };
    }

    angular.module('sds-angular-controls').directive('dbTransclude', dbTransclude);
})();

(function () {
    "use strict";

    // Removes the control from the parent angular form.

    function isolateControl() {
        return {
            restrict: 'A',
            require: ['ngModel', '^?form'],
            link: function (scope, elm, attrs, ctrls) {
                // Do a copy of the controller
                var ctrlCopy = {};
                angular.copy(ctrls[0], ctrlCopy);

                if (ctrls[1]) {
                    ctrls[1].$removeControl(ctrls[0]);
                }

                var isolated = {
                    $addControl    : angular.noop,
                    $removeControl : angular.noop,
                    $setValidity: function (validationToken, isValid, control) {
                        //ctrlCopy.$setValidity(validationToken, isValid, control);
                    },
                    $setDirty: function () {
                        elm.removeClass('ng-pristine').addClass('ng-dirty');
                        ctrls[0].$dirty = true;
                        ctrls[0].$pristine = false;
                    },
                    $setPristine: function () {
                        elm.removeClass('ng-dirty').addClass('ng-pristine');
                        ctrls[0].$dirty = false;
                        ctrls[0].$pristine = true;
                    }
                };
                angular.extend(ctrls[0], isolated);
            }
        };
    }

    angular.module('sds-angular-controls').directive('isolateControl', isolateControl);
})();
angular.module('sds-angular-controls').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('sds-angular-controls/form-directives/form-autocomplete.html',
    "<div class=\"{{::container.layout === 'horizontal' ? layoutCss : '' }}\"> <select ng-if=\"!container.isReadonly && !reload\" ng-readonly=\"container.isReadonly\" ng-required=\"container.isRequired\" name=\"{{::container.field}}\" selectize=\"options\" options=\"innerItems\" class=\"{{::container.layout !== 'horizontal' ? layoutCss : ''}}\" ng-model=\"container.record[container.field]\"></select> <!-- optionValue as optionLabel for arrayItem in array --> <input ng-if=\"container.isReadonly\" style=\"{{::style}}\" readonly type=\"text\" class=\"form-control {{::container.layout !== 'horizontal' ? layoutCss : ''}}\" ng-model=\"readOnlyModel\"> </div>"
  );


  $templateCache.put('sds-angular-controls/form-directives/form-currency-input.html',
    "<div class=\"{{::container.layout === 'horizontal' ? layoutCss : '' }}\"> <input class=\"form-control inputField {{::container.layout !== 'horizontal' ? layoutCss : ''}}\" ng-model=\"container.record[container.field]\" type=\"text\" name=\"{{::container.field}}\" ng-required=\"container.isRequired\" ng-disabled=\"container.isReadonly\" step=\"any\" style=\"{{::style}}\" currency-mask> <div ng-if=\"::(rightLabel && rightLabel.length > 0)\" class=\"rightLabel\">{{::rightLabel}}</div> </div>"
  );


  $templateCache.put('sds-angular-controls/form-directives/form-date-picker.html',
    "<div class=\"{{::container.layout === 'horizontal' ? layoutCss : '' }}\"> <span class=\"input-group {{::container.layout !== 'horizontal' ? layoutCss : ''}}\" ng-if=\"!container.isReadonly\"> <input type=\"text\" style=\"{{::style}}\" class=\"form-control datepicker\" placeholder=\"{{placeholder || container.label}}\" ng-model=\"container.record[container.field]\" ng-model-options=\"modelOptions || {}\" ng-required=\"::container.isRequired\" min-date=\"min\" max-date=\"max\" datepicker-popup=\"{{::dateFormat}}\" is-open=\"calendar.opened\"> <span class=\"input-group-btn\"> <button type=\"button\" class=\"btn btn-default\" ng-click=\"open($event)\"><i class=\"glyphicon glyphicon-calendar\"></i></button> </span> </span> <input ng-if=\"container.isReadonly\" style=\"{{::style}}\" readonly type=\"text\" class=\"form-control {{::container.layout !== 'horizontal' ? layoutCss : ''}}\" ng-model=\"readOnlyModel\"> </div>"
  );


  $templateCache.put('sds-angular-controls/form-directives/form-date-time-picker.html',
    "<div class=\"{{::container.layout === 'horizontal' ? layoutCss : '' }} datepicker timepicker\"> <span class=\"input-group {{::container.layout !== 'horizontal' ? layoutCss : ''}}\" ng-if=\"!container.isReadonly\"> <input type=\"text\" style=\"{{::style}}\" class=\"form-control datepicker\" placeholder=\"{{placeholder || container.label}}\" ng-model=\"container.record[container.field]\" ng-required=\"::container.isRequired\" ng-model-options=\"modelOptions || {}\" min-date=\"min\" max-date=\"max\" datepicker-popup=\"{{::dateFormat}}\" is-open=\"calendar.opened\"> <span class=\"input-group-btn\"> <button type=\"button\" class=\"btn btn-default\" ng-click=\"open($event)\"><i class=\"glyphicon glyphicon-calendar\"></i></button> </span> </span> <timepicker ng-if=\"!container.isReadonly\" ng-model=\"container.record[container.field]\" ng-required=\"::container.isRequired\" ng-if=\"!container.isReadonly\" minute-step=\"1\"></timepicker> <input ng-if=\"container.isReadonly\" style=\"{{::style}}\" readonly type=\"text\" class=\"form-control {{::container.layout !== 'horizontal' ? layoutCss : ''}}\" ng-model=\"readOnlyModel\"> </div>"
  );


  $templateCache.put('sds-angular-controls/form-directives/form-field-validation.html',
    "<div ng-if=\"!hideValidationMessage\" class=\"has-error\" ng-show=\"showError({{field}})\" ng-messages=\"{{field}}.$error\"> <span class=\"control-label\" ng-message=\"required\"> {{ validationFieldName }} is required. </span> <span class=\"control-label\" ng-message=\"text\"> {{ validationFieldName }} should be text. </span> <span class=\"control-label\" ng-message=\"integer\"> {{ validationFieldName }} should be an integer. </span> <span class=\"control-label\" ng-message=\"email\"> {{ validationFieldName }} should be an email address. </span> <span class=\"control-label\" ng-message=\"date\"> {{ validationFieldName}} should be a date. </span> <span class=\"control-label\" ng-message=\"datetime\"> {{ validationFieldName }} should be a datetime. </span> <span class=\"control-label\" ng-message=\"time\"> {{ validationFieldName }} should be a time. </span> <span class=\"control-label\" ng-message=\"month\"> {{ validationFieldName }} should be a month. </span> <span class=\"control-label\" ng-message=\"week\"> {{ validationFieldName }} should be a week. </span> <span class=\"control-label\" ng-message=\"url\"> {{ validationFieldName }} should be an url. </span> <span class=\"control-label\" ng-message=\"zip\"> {{ validationFieldName }} should be a valid zipcode. </span> <span class=\"control-label\" ng-message=\"number\">{{ validationFieldName }} must be a number</span> <span class=\"control-label\" ng-message=\"tel\">{{ validationFieldName }} must be a phone number</span> <span class=\"control-label\" ng-message=\"color\">{{ validationFieldName }} must be a color</span> <span class=\"control-label\" ng-message=\"min\"> {{ validationFieldName }} must be at least {{min}}. </span> <span class=\"control-label\" ng-message=\"max\"> {{ validationFieldName }} must not exceed {{max}} </span> <span class=\"control-label\" ng-repeat=\"(k, v) in types\" ng-message=\"{{k}}\"> {{ validationFieldName }}{{v[1]}}</span> </div>"
  );


  $templateCache.put('sds-angular-controls/form-directives/form-field.html',
    "<div> <div ng-if=\"layout === 'stacked'\" class=\"row\"> <div class=\"form-group clearfix\" ng-form=\"{{field}}\" ng-class=\"{ 'has-error': showError({{field}}) }\"> <div class=\"{{::layoutCss}}\"> <label ng-if=\"showLabel\" class=\"control-label {{labelCss}}\"> {{ label }} <span ng-if=\"isRequired && !isReadonly\">*</span></label> <ng-transclude></ng-transclude> <div ng-if=\"showDefault\"><form-input></form-input></div> <!-- validation --> <div class=\"pull-left\" ng-include=\"'sds-angular-controls/form-directives/form-field-validation.html'\"></div> </div> </div> </div> <div ng-if=\"layout === 'horizontal'\" class=\"row inline-control\"> <div class=\"form-group clearfix\" ng-form=\"{{field}}\" ng-class=\"{ 'has-error': showError({{field}}) }\"> <label ng-if=\"showLabel\" class=\"control-label {{labelCss}}\"> {{ label }} <span ng-if=\"isRequired && !isReadonly\">*</span></label> <ng-transclude></ng-transclude> <div ng-if=\"showDefault\"><form-input></form-input></div> <!-- validation --> <div ng-if=\"!hideValidationMessage\" ng-show=\"showError({{field}})\" class=\"popover validation right alert-danger\" style=\"display:inline-block; top:auto; left:auto; margin-top:-4px; min-width:240px\"> <div class=\"arrow\" style=\"top: 20px\"></div> <div class=\"popover-content\" ng-include=\"'sds-angular-controls/form-directives/form-field-validation.html'\"> </div> </div> </div> </div> <div ng-if=\"layout !== 'stacked' && layout !== 'horizontal'\" ng-form=\"{{field}}\" ng-class=\"{ 'has-error': showError({{field}}) }\" class=\"grid-control {{::layoutCss}}\"> <ng-transclude></ng-transclude> <div ng-if=\"showDefault\"><form-input></form-input></div> </div> <div ng-if=\"log\"> form-input value: {{record[field]}}<br> {{isRequired}} </div> </div>"
  );


  $templateCache.put('sds-angular-controls/form-directives/form-input.html',
    "<div class=\"{{::container.layout === 'horizontal' ? layoutCss : '' }}\"> <input class=\"form-control inputField {{::container.layout !== 'horizontal' ? layoutCss : ''}}\" ng-model=\"container.record[container.field]\" name=\"{{::container.field}}\" type=\"{{::type}}\" ng-if=\"type !== 'number'\" ng-required=\"container.isRequired\" ng-disabled=\"container.isReadonly\" placeholder=\"{{container.isReadonly ? &quot;&quot; : placeholder || container.label}}\" style=\"{{::style}}\" mask-input=\"{{mask}}\" maxlength=\"{{maxlength || ''}}\" minlength=\"{{minlength || -1}}\"> <input class=\"form-control inputField {{::container.layout !== 'horizontal' ? layoutCss : ''}}\" ng-model=\"container.record[container.field]\" name=\"{{::container.field}}\" type=\"number\" ng-if=\"type === 'number'\" ng-required=\"container.isRequired\" ng-disabled=\"container.isReadonly\" placeholder=\"{{container.isReadonly ? &quot;&quot; : placeholder || container.label}}\" min=\"{{::min}}\" max=\"{{::max}}\" step=\"{{::step}}\" style=\"{{::style}}\" mask-input=\"{{mask}}\"> <div ng-if=\"::(rightLabel && rightLabel.length > 0)\" class=\"rightLabel\">{{::rightLabel}}</div> </div>"
  );


  $templateCache.put('sds-angular-controls/form-directives/form-multi-select.html',
    "<div class=\"{{::container.layout === 'horizontal' ? layoutCss : '' }}\"> <input ng-if=\"!container.isReadonly\" ng-readonly=\"container.isReadonly\" ng-required=\"container.isRequired\" name=\"{{::container.field}}\" selectize=\"options\" options=\"items\" class=\"{{::container.layout !== 'horizontal' ? layoutCss : ''}}\" ng-model=\"container.record[container.field]\"> <!-- optionValue as optionLabel for arrayItem in array --> <input ng-if=\"container.isReadonly\" style=\"{{::style}}\" readonly type=\"text\" class=\"form-control {{::container.layout !== 'horizontal' ? layoutCss : ''}}\" ng-model=\"readOnlyModel\"> </div>"
  );


  $templateCache.put('sds-angular-controls/form-directives/form-select.html',
    "<div class=\"{{::container.layout === 'horizontal' ? layoutCss : '' }}\"> <select ng-if=\"!container.isReadonly\" class=\"form-control {{::container.layout !== 'horizontal' ? layoutCss : ''}}\" name=\"{{::container.field}}\" ng-model=\"container.record[container.field]\" ng-options=\"convertType(key) as innerItems[key] for key in orderHash(innerItems)\" ng-required=\"container.isRequired\"></select> <!-- optionValue as optionLabel for arrayItem in array --> <input ng-if=\"container.isReadonly\" style=\"{{::style}}\" readonly type=\"text\" class=\"form-control {{::container.layout !== 'horizontal' ? layoutCss : ''}}\" ng-model=\"readOnlyModel\"> </div>"
  );


  $templateCache.put('sds-angular-controls/form-directives/form-text-area.html',
    "<div class=\"{{::container.layout === 'horizontal' ? layoutCss : '' }}\"> <textarea class=\"form-control inputField {{::container.layout !== 'horizontal' ? layoutCss : ''}}\" ng-model=\"container.record[container.field]\" name=\"{{::container.field}}\" ng-required=\"container.isRequired\" ng-disabled=\"container.isReadonly\" maxlength=\"{{maxlength || ''}}\" minlength=\"{{minlength || -1}}\" style=\"{{::style}}\"></textarea> </div>"
  );


  $templateCache.put('sds-angular-controls/form-directives/form-text-toggle.html',
    "<div class=\"{{::container.layout === 'horizontal' ? layoutCss : '' }} text-toggle\"> <input type=\"text\" ng-disabled=\"container.isReadonly\" type=\"{{::type}}\" class=\"form-control {{::container.layout !== 'horizontal' ? layoutCss : ''}}\" ng-required=\"container.isRequired\" ng-model=\"container.record[container.field]\"> <!-- bug in toggle where setting any disabled makes it disabled - so needing an if here --> <toggle-switch ng-if=\"container.isReadonly\" is-disabled=\"true\" class=\"{{::toggleSwitchType}}\" ng-model=\"container.record[toggleField]\" on-label=\"{{::onLabel}}\" off-label=\"{{::offLabel}}\"> </toggle-switch> <toggle-switch ng-if=\"!container.isReadonly\" class=\"{{::toggleSwitchType}}\" ng-model=\"container.record[toggleField]\" on-label=\"{{::onLabel}}\" off-label=\"{{::offLabel}}\"> </toggle-switch> </div>"
  );


  $templateCache.put('sds-angular-controls/form-directives/form-time-picker.html',
    "<div class=\"{{::container.layout === 'horizontal' ? layoutCss : '' }} timepicker\"> <timepicker ng-model=\"container.record[container.field]\" ng-required=\"::container.isRequired\" ng-if=\"!container.isReadonly\" minute-step=\"1\"></timepicker> <input ng-if=\"container.isReadonly\" style=\"{{::style}}\" readonly type=\"text\" class=\"form-control {{::container.layout !== 'horizontal' ? layoutCss : ''}}\" ng-model=\"readOnlyModel\"> </div>"
  );


  $templateCache.put('sds-angular-controls/form-directives/form-toggle.html',
    "<div class=\"{{::container.layout === 'horizontal' ? layoutCss : '' }}\"> <!-- bug in toggle where setting any disabled makes it disabled - so needing an if here --> <toggle-switch ng-if=\"container.isReadonly\" style=\"{{::style}}\" is-disabled=\"true\" class=\"{{::toggleSwitchType}}\" ng-model=\"container.record[container.field]\" on-label=\"{{::onLabel}}\" off-label=\"{{::offLabel}}\"> </toggle-switch> <toggle-switch ng-if=\"!container.isReadonly\" style=\"{{::style}}\" class=\"{{::toggleSwitchType}}\" ng-model=\"container.record[container.field]\" on-label=\"{{::onLabel}}\" off-label=\"{{::offLabel}}\"> </toggle-switch> </div>"
  );


  $templateCache.put('sds-angular-controls/table-directives/db-grid.html',
    "<div class=\"table-responsive db-grid\"> <div class=\"btn-toolbar\"> <a ng-if=\"_model.showAdvancedFilter\" href=\"\" class=\"btn btn-default\" ng-click=\"_model.clearFilters()\">Clear All Filters <span class=\"big-x\">&times;</span></a> <div ng-if=\"!_model.showAdvancedFilter && _model.filterType !== 'none'\" class=\"toolbar-input\"> <div class=\"form-group has-feedback\"> <input class=\"form-control\" type=\"text\" ng-model=\"_model.filterText\" ng-keyup=\"$grid.refresh()\" placeholder=\"Filter {{_model.label || 'items'}}\" on-enter=\"_model.onEnter()\" isolate-control> <a href=\"\" ng-click=\"_model.filterText = ''; $grid.refresh()\" class=\"form-control-feedback feedback-link\">&times;</a> </div> </div> <a href=\"\" ng-if=\"_model.filterType === 'advanced'\" class=\"btn btn-default\" ng-class=\"{'btn-primary': _model.showAdvancedFilter}\" ng-click=\"_model.showAdvancedFilter = !_model.showAdvancedFilter\">{{_model.showAdvancedFilter ? 'Simple' : 'Advanced'}} Filtering</a> <db-transclude></db-transclude> <p ng-if=\"_model.total && _model.label\"><i>{{_model.total}} {{_model.label}}</i></p> </div> <table class=\"table db-grid table-hover {{_model.layoutCss}}\"> <thead> <tr ng-if=\"_model.showAdvancedFilter\"> <th ng-repeat=\"_col in _model.cols\" ng-style=\"{width: _col.width}\" class=\"{{_col.layoutCss}}\"> <div ng-if=\"::_col.sortable\"> <input type=\"text\" class=\"form-control filter-input\" on-enter=\"_model.onEnter()\" ng-keyup=\"$grid.refresh()\" ng-model=\"_col.filter\" placeholder=\"Filter {{::_col.label || (_col.key | labelCase)}}\" tooltip=\"{{_model.getTooltip(_col)}}\" tooltip-trigger=\"focus\" tooltip-placement=\"top\" isolate-control> </div>   <tr> <th ng-repeat=\"_col in _model.cols\" ng-style=\"{width: _col.width}\" class=\"{{_col.layoutCss}}\"> <a href=\"\" ng-if=\"::_col.sortable\" ng-click=\"_model.toggleSort($index)\">{{::_col.label || (_col.key | labelCase) }}&nbsp;<i class=\"fa\" style=\"display: inline\" ng-class=\"{\n" +
    "                         'fa-sort'     : _model.sort !== $index,\n" +
    "                         'fa-sort-down': _model.sort === $index &&  _model.sortAsc,\n" +
    "                         'fa-sort-up'  : _model.sort === $index && !_model.sortAsc\n" +
    "                         }\"></i> </a> <span ng-if=\"::!_col.sortable\"> {{::_col.label || (_col.key | labelCase)}} </span>    <tbody ng-show=\"!_model.waiting\"> <tr> <td ng-repeat=\"_col in _model.cols\" db-bind-cell>   </table> <div ng-if=\"_model.filteredItems && _model.filteredItems.length === 0 && _model.label && !_model.waiting\" class=\"db-summary\"> No {{_model.label}}. </div> <ul class=\"pagination\" ng-if=\"_model.total > _model.pageSize && !_model.waiting\"> <li ng-if=\"_model.currentPage > 1\"> <a href=\"\" aria-label=\"First\" ng-click=\"_model.currentPage = 1\"> <span aria-hidden=\"true\">First</span> </a> </li> <li class=\"disabled\" ng-if=\"_model.currentPage <= 1\"> <a href=\"\" aria-label=\"First\"> <span aria-hidden=\"true\">First</span> </a> </li> <li ng-if=\"_model.currentPage > 1\"> <a href=\"\" aria-label=\"Previous\" ng-click=\"_model.currentPage = _model.currentPage - 1\"> <span aria-hidden=\"true\">&lt;</span> </a> </li> <li class=\"disabled\" ng-if=\"_model.currentPage <= 1\"> <a href=\"\" aria-label=\"Previous\"> <span aria-hidden=\"true\">&lt;</span> </a> </li> <li ng-repeat=\"page in _model.getPages()\" ng-class=\"{active: page === _model.currentPage}\"> <a href=\"\" ng-click=\"_model.currentPage = page\">{{page}}</a> </li> <li ng-if=\"_model.currentPage < (_model.total / _model.pageSize)\"> <a href=\"\" aria-label=\"Next\" ng-click=\"_model.currentPage = _model.currentPage + 1\"> <span aria-hidden=\"true\">&gt;</span> </a> </li> <li class=\"disabled\" ng-if=\"_model.currentPage >= (_model.total / _model.pageSize)\"> <a href=\"\" aria-label=\"Next\" class=\"disabled\"> <span aria-hidden=\"true\">&gt;</span> </a> </li> <li ng-if=\"_model.currentPage < (_model.total / _model.pageSize)\"> <a href=\"\" aria-label=\"Last\" ng-click=\"_model.currentPage = 1 + (_model.total - (_model.total % _model.pageSize)) / _model.pageSize\"> <span aria-hidden=\"true\">Last ({{1 + (_model.total - (_model.total % _model.pageSize)) / _model.pageSize}})</span> </a> </li> <li class=\"disabled\" ng-if=\"_model.currentPage >= (_model.total / _model.pageSize)\"> <a href=\"\" aria-label=\"Last\" class=\"disabled\"> <span aria-hidden=\"true\">Last ({{1 + (_model.total - (_model.total % _model.pageSize)) / _model.pageSize}})</span> </a> </li> </ul> <div ng-show=\"_model.waiting\"> <i class=\"fa fa-circle-o-notch fa-spin\"></i> Please Wait... </div> </div>"
  );

}]);


(function () {
    'use strict';

    // For internal use. Manually binds a template using a provided template function, with a fallback to $compile.
    // Needs to be lightweight.

    function dbBindCell ($compile, $parse) {
        function getInputs(obj, $scope, safeScope){
            if (obj && obj.sharedGetter){
                var  val = obj($scope);
                if (typeof val === "string"){
                    val = document.createElement('div').appendChild(document.createTextNode(val)).parentNode.innerHTML;
                }
                obj.assign(safeScope, val);

            }else if(obj.inputs) {
                _.forOwn(obj.inputs, function (child) {
                    if (child) {
                        getInputs(child, $scope, safeScope)
                    }
                })
            }

            return safeScope;
        }

        return{
            restrict: 'A',
            link: function ($scope, $element) {
                if (typeof $scope._col.template === 'function'){
                    var safeScope = {};
                    _.each($scope._col.template.expressions, function (key){
                        getInputs($parse(key), $scope, safeScope);
                    });

                    $element.append($scope._col.template(safeScope));
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


    angular.module('sds-angular-controls').directive('dbBindCell', dbBindCell);
})();


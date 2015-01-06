
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
                var templateText = tElement.html();
                tElement.empty();

                return function (scope, element, attr, dbGrid) {
                    var templateFunc = null;
                    if (!templateText && attr.key){
                        console.log(scope);
                        templateText = '{{' + scope.$parent.rowName + '.' + attr.key + '}}'
                    }

                    if (attr.bind === 'true'){
                        templateFunc = templateText;
                    }else{
                        templateFunc = $interpolate(templateText);
                    }

                    dbGrid.addColumn({
                        width: attr.width,
                        key: attr.key,
                        label: attr.label,
                        sortable: attr.sortable !== 'false',
                        type: attr.type,
                        bind: attr.bind === 'true',
                        template: templateFunc
                    });
                }
            }
        }
    }

    angular.module('sds-angular-controls').directive('dbCol', dbCol);
})();
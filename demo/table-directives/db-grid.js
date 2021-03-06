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
            controller: function ($scope, $element, $attrs){
                var complexFilter = $filter('complexFilter');
                var orderByFilter = $filter('orderBy');
                var pageFilter = $filter('page');

                $scope._model = {
                    isApi: false,
                    label: $attrs.label,
                    layoutCss: $attrs.layoutCss,
                    paging: $attrs.paging,
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
                    setPage: setPage,
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
                    saveState();
                }

                function clearFilters(){
                    _.each($scope._model.cols, function (item){
                       item.filter = '';
                    });
                    saveState();
                    $scope._model.refresh();
                }

                function setPage (page){
                    $scope._model.currentPage = page;
                    saveState();
                    refresh();
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
                    $scope._model.getItems(
                        $scope._model.showAdvancedFilter ? $scope._model.cols : $scope._model.filterText,
                        $scope._model.sort === null ? null : $scope._model.cols[$scope._model.sort].key,
                        $scope._model.sortAsc,
                        $scope._model.currentPage - 1,
                        $scope._model.pageSize,
                        $scope._model.cols
                    ).then(function (result){
                        $scope._model.filteredItems = result;
                    });
                }

                function saveState(){
                    if ($scope._model.savePlace){
                        window.sessionStorage.setItem($scope.$id, JSON.stringify({
                            filterText: $scope._model.filterText,
                            showAdvancedFilter: $scope._model.showAdvancedFilter,
                            sort: $scope._model.sort,
                            sortAsc: $scope._model.sortAsc,
                            currentPage: $scope._model.currentPage,
                            filters: $scope._model.cols.map(function (v){ return v.filter; })
                        }));
                    }
                }

                function loadState(){
                    if ($scope._model.savePlace){
                        var saved = JSON.parse(window.sessionStorage.getItem($scope.$id));
                        if (saved && saved.currentPage) {
                            $scope._model.filterText = saved.filterText;
                            $scope._model.showAdvancedFilter = saved.showAdvancedFilter;
                            $scope._model.sort = saved.sort;
                            $scope._model.sortAsc = saved.sortAsc;
                            $scope._model.currentPage = saved.currentPage;

                            angular.forEach(saved.filters, function (v, i){
                                $scope._model.cols[i].filter = v;
                            });
                        }


                    }
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


            }
        };
    }

    angular.module('sds-angular-controls').directive('dbGrid', dbGrid);
})();

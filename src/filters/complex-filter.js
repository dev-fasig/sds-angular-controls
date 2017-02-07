/*
    This filter will take an object of filters to reduce from:
    {
        columnName1: "value"
        ColumnName2: 11
        ColumnName3: [rangeStart, rangeEnd],
        all: "general filter"
    }
 */
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
                    return _.every(filters, function (col) {
                        if (!col.key) {
                            return true;
                        } else if (!col.type && _.isObject(prop(item,col.key))) {
                            return _.some(prop(item,col.key), function (v){
                                if (_.isPlainObject(v)){
                                    return _.some(v, function (vv){
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

    angular.module('sds-angular-controls').filter('complexFilter', complexFilter);
})();

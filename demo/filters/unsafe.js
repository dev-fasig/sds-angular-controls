(function (){
    'use strict';

    function unsafe ($sce) { return $sce.trustAsHtml; }

    angular.module('sds-angular-controls').filter('unsafe', unsafe);
})();

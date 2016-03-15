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

    angular.module('sds-angular-controls').filter('sanitize', sanitize);
})();

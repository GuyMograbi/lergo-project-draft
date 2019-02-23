(function () {
    'use strict';

    /**
    * @ngdoc directive
    * @name lergoApp.directive:filterIsActive
    * @description
    * # filterIsActive
    */
    angular.module('lergoApp')
        .directive('filterIsActive', function (LergoFilterService ) {
            return {
                templateUrl: 'views/directives/_filterIsActive.html',
                restrict: 'A',
                scope:{
                    relevancyOpts: '=filterIsActive'
                },
                link: function postLink(scope, element, attrs) {


                    scope.getSection = function(){
                        var section = attrs.section;
                        if ( !section ){
                            section = '';
                        }else{
                            section = section + '.';
                        }
                        return  section;
                    };

                    scope.hideNotification = function(){
                        element.hide();
                    };

                    scope.resetFilter = function(){
                        LergoFilterService.resetFilter(LergoFilterService.RESET_TYPES.LOGO);
                    };
                }
            };
        });
})();

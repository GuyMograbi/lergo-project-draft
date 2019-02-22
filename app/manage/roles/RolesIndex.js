(function(){
    'use strict';

    /**
     * @ngdoc function
     * @name lergoApp.controller:RolesIndexCtrl
     * @description
     * # RolesIndexCtrl
     * Controller of the lergoApp
     */
    angular.module('lergoApp')
        .controller('RolesIndexCtrl', function ($scope, LergoClient, $location, $log ) {
            $scope.getRoleName = function( role ){
                if ( role.name && role.name.trim().length > 0 ) {
                    return role.name;
                }else{
                    return 'no name.. :(';
                }
            };

            $scope.create = function() {
                LergoClient.roles.create().then(function( result ){
                    var role = result.data;
                    $scope.errorMessage = null;
                    $location.path('/manage/roles/' + role._id + '/update');
                }, function( result ){
                    $scope.errorMessage = 'unknown error';
                    try {
                        $scope.errorMessage = 'Error creating role ' + result.data.message;
                    }catch(e){}
                    $log.error($scope.errorMessage);
                    toastr.error($scope.errorMessage,'Error');
                });
            };

            LergoClient.roles.list({}).then(function onSuccess(result) {
                $scope.roles = result.data.data;
            }, function onError( result ) {
                toastr.error(result.data, 'Error');
            });

        });
    })();

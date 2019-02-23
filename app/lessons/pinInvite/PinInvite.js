(function(){    
    /**
     * Created by rahul on 6/11/16.
     */
    'use strict';
    PinInviteCtrl.$inject = ['$scope', 'LessonsInvitationsService', '$location'];
    function PinInviteCtrl($scope, LessonsInvitationsService, $location) {


        $scope.getLesson = function () {

            LessonsInvitationsService.getByPin($scope.pin).then(function (result) {
                redirectToLesson(result.data);
            });
        };

        function redirectToLesson(invitation) {
            if (!invitation) {
                $scope.invalidPin=true;
                return;
            }
            if (!!invitation.invitee.name) {
                $location.path('/public/lessons/' + invitation.lessonId + '/intro').search(
                    {'invitationId': invitation._id});
            }
            if (!!invitation.invitee.class) {
                $location.path('/public/lessons/' + invitation.lessonId + '/classInvite').search(
                {'invitationId': invitation._id});
            }
        }
    }
angular.module('lergoApp')
    .controller('PinInviteCtrl', PinInviteCtrl);
})();

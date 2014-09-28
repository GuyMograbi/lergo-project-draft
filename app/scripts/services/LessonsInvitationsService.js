'use strict';

angular.module('lergoApp')
    .service('LessonsInvitationsService', function LessonsInvitationsService($http) {


        this.create = function (lessonId, invitation) {
            return $http.post('/backend/lessons/' + lessonId + '/invitations/create', invitation);
        };

        this.createAnonymous = function( lessonId ){
            return $http.post('/backend/lessons/' + lessonId + '/invitations/create');
        };

        this.build = function (invitationId, constructLesson, forceConstruct) {
            return $http({
                url: '/backend/lessonsinvitations/' + invitationId + '/build',
                method: 'GET',
                params: { construct: constructLesson, forceConstruct: forceConstruct}
            });

        };

    });

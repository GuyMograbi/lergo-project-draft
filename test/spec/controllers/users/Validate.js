'use strict';

describe('Controller: UsersValidateCtrl', function () {

    // load the controller's module
    beforeEach(module('lergoApp'));

    var UsersValidateCtrl,
        scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        UsersValidateCtrl = $controller('UsersValidateCtrl', {
            $scope: scope
        });
    }));

    it('should attach validationInProgress scope', function () {
        expect(scope.validationInProgress).toBe(true);
    });
});

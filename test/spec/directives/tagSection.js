'use strict';

describe('Directive: tagSection', function () {
    beforeEach(module('lergoApp', 'directives-templates', 'lergoBackendMock'));

    var element;

    it('should contain tag-section-wrapper', inject(function ($rootScope, $compile) {
        element = angular.element('<div tag-section></div>');
        element = $compile(element)($rootScope);
        $rootScope.$digest();
        expect(element.find('.tag-section-wrapper').length).toBe(1);
    }));
});

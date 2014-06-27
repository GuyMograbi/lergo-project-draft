'use strict';

angular.module('lergoApp')
    .filter('countQuestionsOnLesson', function () {

        return function (item) {
            var qCount = 0;
            if (!item || !item.steps) {
                return qCount;
            }
            for (var i = 0; i < item.steps.length; i++) {
                if (!!item.steps[i].quizItems) {
                    qCount = qCount + item.steps[i].quizItems.length;
                }
            }
            return qCount;

        };
    });

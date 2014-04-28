'use strict';

angular.module('lergoApp').controller('LessonCtrl', function ($scope, $log, LergoClient, $location, $routeParams, ContinuousSave) {

    var saveLesson = new ContinuousSave({
        'saveFn': function (value) {
            return LergoClient.lessons.update(value);
        }
    });

	$scope.isSaving = function() {
		return !!saveLesson.getStatus().saving;
	};

	LergoClient.lessons.getById($routeParams.lessonId).then(function(result) {
		$scope.lesson = result.data;
		$scope.errorMessage = null;
		$scope.$watch('lesson', saveLesson.onValueChange, true);
	}, function(result) {
		$scope.errorMessage = 'Error in fetching Lesson by id : ' + result.data.message;
		$log.error($scope.errorMessage);
	});

	$scope.stepTypes = [ {
		'id' : 'video',
		'label' : 'Video'
	}, {
		'id' : 'quiz',
		'label' : 'Quiz'
	} ];

    LergoClient.lessons.getById($routeParams.lessonId).then(function (result) {
        $scope.lesson = result.data;
        $scope.$watch('lesson', saveLesson.onValueChange, true);
    });

	$scope.addStep = function(lesson) {
		if (!lesson.steps) {
			lesson.steps = [];
		}

		lesson.steps.push({});
	};
	$scope.moveStepUp = function(index) {
		var temp = $scope.lesson.steps[index - 1];
		if (temp) {
			$scope.lesson.steps[index - 1] = $scope.lesson.steps[index];
			$scope.lesson.steps[index] = temp;
		}
	};
	$scope.moveStepDown = function(index) {
		var temp = $scope.lesson.steps[index + 1];
		if (temp) {
			$scope.lesson.steps[index + 1] = $scope.lesson.steps[index];
			$scope.lesson.steps[index] = temp;
		}

	};

	$scope.done = function() {
		$location.path('/user/lessons');
	};

	$scope.getStepViewByType = function(step) {
		var type = 'none';
		if (!!step && !!step.type) {
			type = step.type;
		}
		return 'views/lesson/steps/_' + type + '.html';
	};

	LergoClient.questions.getUserQuestions().then(function(result) {
		$scope.quizItems = result.data;
		$scope.errorMessage = null;
	}, function(result) {
		$scope.errorMessage = 'Error in fetching questions for user : ' + result.data.message;
		$log.error($scope.errorMessage);
	});

    var quizItemsWatch = [];
    $scope.quizItemsData = {};

    $scope.getQuestion = function (item) {
        if ($scope.quizItemsData.hasOwnProperty(item)) {
            return $scope.quizItemsData[item].question;
        }
        return null;
    };

    /** watch questions in step. iterates over all steps of type 'quiz' and turns the quizItems arrays to a single array **/
    $scope.$watch(function () {
        if (!$scope.lesson) {
            return quizItemsWatch;
        }

        quizItemsWatch.splice(0, quizItemsWatch.length);


        $scope.lesson.steps.forEach(function (step/*, index*/) {
            if (!!step.quizItems && step.quizItems.length > 0) {

                step.quizItems.forEach(function (quizItem) {

                    if (quizItemsWatch.indexOf(quizItem) < 0) {
                        quizItemsWatch.push(quizItem);
                    }

                });
            }
        });
        return quizItemsWatch;
    }, function (newValue, oldValue) {
        if (!!newValue && newValue.length > 0) {
            $log.info('quizItems changed', newValue, oldValue);
            LergoClient.questions.findQuestionsById(newValue).then(function (result) {
                var newObj = {};
                for (var i = 0; i < result.data.length; i++) {
                    newObj[result.data[i]._id] = result.data[i];
                }
                $scope.quizItemsData = newObj;
            });
        }
    }, true);


    $scope.done = function () {
        $location.path('/user/lessons');
    };

    $scope.getStepViewByType = function (step) {
        var type = 'none';
        if (!!step && !!step.type) {
            type = step.type;
        }
        return 'views/lesson/steps/_' + type + '.html';
    };

    LergoClient.questions.getUserQuestions().then(function (result) {
        $scope.quizItems = result.data;
    });

    $scope.removeItemFromQuiz = function (item, step) {
        if (!!step.quizItems && step.quizItems.length > 0 && step.quizItems.indexOf(item) >= 0) {
            step.quizItems.splice(step.quizItems.indexOf(item), 1);
        }
    };


    $scope.addItemToQuiz = function (itemId, step) {

        step.quizItems = step.quizItems || [];
        if (step.quizItems.indexOf(itemId) < 0) {
            step.quizItems.push(itemId);
        }
    };


});

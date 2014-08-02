'use strict';

angular.module('lergoApp').directive('lessonView', function($log, LergoClient) {
	return {
		templateUrl : 'views/lessons/invitations/report/_display.html',
		restrict : 'A',
		scope : {
			'lesson' : '=',
			'answers' : '=',
			'quizItems' : '='
		},
		link : function($scope/* , element, attrs */) {

			$log.info('showing lesson report');

			function getAnswer(quizItemId, index) {
				for ( var i = 0; i < $scope.answers.length; i++) {
					var answer = $scope.answers[i];
					if ((answer.quizItemId === quizItemId) && (answer.stepIndex === index)) {
						return answer;
					}
				}
				return null;
			}

			function getQuizItem(quizItemId) {
				for ( var i = 0; i < $scope.quizItems.length; i++) {
					if ($scope.quizItems[i]._id === quizItemId) {
						return $scope.quizItems[i];
					}
				}
				return null;
			}

			$scope.getQuizItemTemplate = function(type) {
				return LergoClient.questions.getTypeById(type).reportTemplate;
			};
			// This will test in case of multi choice multi answer that which
			// all answers are correct
			$scope.isCorrectAnswer = function(quizItem, answer) {

				for ( var i = 0; i < quizItem.options.length; i++) {
					if (quizItem.options[i].label === answer) {
						if (quizItem.options[i].checked === true) {
							return true;
						} else {
							return false;
						}
					}
				}
				return false;
			};

			$scope.isCorrectFillInTheBlanks = function(quizItem, answer) {

				if (!answer) {
					return false;
				}
				var index = quizItem.userAnswer.indexOf(answer);
				if (quizItem.answer[index].split(';').indexOf(answer) === -1) {
					return false;
				} else {
					return true;
				}
			};

			// /////////////// construct a single object with question, user
			// answer and answer check

			var reportQuizItems = {}; // cache

			$scope.getReportQuizItems = function(step, index) {

				if (reportQuizItems.hasOwnProperty('' + index)) {
					return reportQuizItems['' + index];
				}

				var results = [];

				var quizItemsIds = $scope.lesson.steps[index].quizItems;

				$log.info('getting report quiz Items', step);

				for ( var i = 0; i < quizItemsIds.length; i++) {
					var qiId = quizItemsIds[i];

					var answer = getAnswer(qiId, index);
					var qi = getQuizItem(qiId);

					results.push(_.merge({}, qi, answer));

				}
				$log.info('quizItems', results);
				reportQuizItems['' + index] = results;
				$scope.getAnswerStats(results, index);
				return results;
			};

			$scope.getAnswerStats = function(quizItems, index) {
				if (!quizItems || quizItems.length < 1) {
					return;
				}
				var duration = 0;
				var stats = {
					'correct' : 0,
					'wrong' : 0,
					'correctPercentage' : 0,
					'wrongPercentage' : 0,
					'openQuestions' : 0
				};
				for ( var i = 0; i < quizItems.length; i++) {
					if (quizItems[i].type === 'openQuestion') {
						stats.openQuestions = stats.openQuestions + 1;
					} else if (!!quizItems[i].checkAnswer) {
						if (quizItems[i].checkAnswer.correct) {
							stats.correct = stats.correct + 1;
						} else {
							stats.wrong = stats.wrong + 1;
						}
					}
					duration = duration + quizItems[i].duration;
				}
				var correctPercentage = ((stats.correct * 100) / (quizItems.length - stats.openQuestions));
				stats.correctPercentage = Math.round(correctPercentage);

				var wrongPercentage = ((stats.wrong * 100) / (quizItems.length - stats.openQuestions));
				stats.wrongPercentage = Math.round(wrongPercentage);
				stats.index = index;
				stats.duration = $scope.getDuration(duration);
				$scope.$emit('stats', stats);
			};

			$scope.getStepViewByType = function(step) {
				var result = '/views/lessons/invitations/report/steps/_' + step.type + '.html';
				$log.info('result', result);
				return result;
			};

			$scope.getDuration = function(duration) {

                function pad( number ){
                    return ( '00' + number ).slice(-2);
                }

				if (!duration) {
					return '00:00:00';
				}
				var durationInSeconds = Math.floor(duration / 1000);
                var durationInMinutes = Math.floor( durationInSeconds / 60 );
                var durationInHours = Math.floor( durationInMinutes / 60 );

                return pad(durationInHours) + ':' + pad( durationInMinutes % 60 ) + ':' + pad( durationInSeconds % 60 );


			};

		}

	};
});

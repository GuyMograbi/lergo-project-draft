'use strict';

/**
 * 
 * This controller write the events from a lesson a report model
 * 
 * Usage example: // example - lets say we have viewing a lesson $scope.data =
 * lesson; // lets add a report to the lesson lesson.report = {}; // lets put
 * the report on the scope $scope.report = lesson.report; // call the report
 * controller - the controller will look for "report" on the scope
 * $controller('LessonsReportWriteCtrl', {$scope: $scope}); // listen to writing
 * on the report and do something with it $scope.$watch('report', function(){
 * 
 * do something when the repost changes
 * 
 * });
 * 
 * 
 * 
 * 
 * 
 * The proper structure for a report is the same as a constructed invitation but
 * with more data on it - it holds the real quiz item instead of an ID - it
 * holds the user's answer for each quiz item - it holds the "checkAnswer"
 * response for each answer
 * 
 */

angular.module('lergoApp').controller('LessonsReportWriteCtrl', function($scope, ReportWriteService, $log,LergoClient) {

	var report = $scope.report;
	if (!report.answers) {
		report.answers = [];
	}
	if (!report.stepDurations) {
		report.stepDurations = [];
	}
	var stepIndex = 0;

	$scope.$on('startLesson', function(event, data) {
		$log.info('starting lesson');
		if (!report.data) {
			report.data = data;
		}
	});

	$scope.$on('endLesson', function(/* event, data */) {
		$log.info('lesson ended');
        // mark invitation as finished
        if (!report.data.finished) {
            report.data.finished = true;
        }
        // mark report as finished
		if (!report.finished) {
			report.finished = true;
		}
		if(!!report.data.lesson.temporary){
			LergoClient.lessons.delete(report.data.lesson._id);
		}
	});

	// data is step

	// guy - deprecated, use stepIndexChange instead.
	// $scope.$on('nextStepClick', function(event, data) {
	// $log.info('nextStepClicked', event, data);
	// stepIndex++;
	// });

	$scope.$on('stepIndexChange', function(event, data) {
		$log.info('stepIndexChange', data);
		/* jshint -W052 */
		stepIndex = ~~data.new;
        // update new duration only if we are still looking at steps inside the
		// lesson.
        if ( stepIndex <= report.data.lesson.steps.length ){
            var newDuration = report.stepDurations[stepIndex];

            if (!newDuration) {
                newDuration = {};
                report.stepDurations.push(newDuration);
            }

            if (!newDuration.startTime) {
                newDuration.startTime = new Date().getTime();
            }
        }



        ReportWriteService.calculateOldStepDuration( report, data ); // updates
																		// report
																		// model
        report.duration = ReportWriteService.calculateReportDuration(report); // does
																				// not
																				// update
																				// report
																				// model
	});

	// in case user answered a question, and then changed the answer, we
	// will need to find the answer again
	function findAnswer(data, stepIndex ) {
		for ( var i = 0; i < report.answers.length; i++) {
			var item = report.answers[i];
			if ((item.quizItemId === data.quizItemId) && (item.stepIndex === stepIndex)) {
				return item;
			}
		}
		return null;
	}

	// the idea is we always keep data without changing it.
	// when the report is done, lesson should look like lesson,
	// quizItems should be ids,
	// questions should be the object for the quiz items..
	// just like in DB...
	// the report only adds the answers the user game and whether they are right
	// or not.
	// in order to track down each answer and its correlating step

	$scope.$on('questionAnswered', function(event, data) {
		$log.info('question was answered', data);
		// find answer
		var answer = findAnswer(data, stepIndex);

		if (!answer) { // add if not exists
            answer = {};
            report.answers.push(answer);

            // update the answer
            _.merge(answer, {
                'stepIndex': stepIndex,
                'quizItemId': data.quizItemId,
                'userAnswer': data.userAnswer,
                'checkAnswer': data.checkAnswer,
                'isHintUsed': data.isHintUsed,
                'duration': data.duration
            });
        }else{ // assuming retry
            if ( !answer.retries ){
                answer.retries = [];
            }
            answer.retries.push(data);
        }

        calculateCorrectPercentage(report);

	});

	$log.info('report writer initialized');




    function calculateCorrectPercentage(report) {
        var correct = 0;
        var wrong = 0;
        report.correctPercentage = 0;
        var numberOfQuestions = 0;
        angular.forEach(report.data.lesson.steps, function (step) {
            if (step.type === 'quiz' && !!step.quizItems) {
                numberOfQuestions = numberOfQuestions + step.quizItems.length;
            }
        });
        if (!!report.data.quizItems && numberOfQuestions > 0) {
            angular.forEach(report.answers, function (answer) {
                if (answer.checkAnswer.correct === true) {
                    correct++;
                } else {
                    wrong++;
                }
            });

            report.correctPercentage = Math.round((correct * 100) / numberOfQuestions);
        }

        $log.info('new correct percentage is : ', report.correctPercentage);

    }

});

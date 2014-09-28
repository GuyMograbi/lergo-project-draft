'use strict';

angular.module('lergoApp').controller('LessonsInvitationsDisplayCtrl', function($scope, LergoClient, $location, $routeParams, $log, $controller, ContinuousSave, $rootScope, FilterService) {

	$log.info('loading invitation', $routeParams.invitationId);

	var updateChange = new ContinuousSave({
		'saveFn' : function(value) {
			$log.info('updating report');
			return LergoClient.reports.update(value);
		}
	});

	function initializeReport(invitation) {

		// broadcast start of lesson
		function initializeReportWriter(report) {
			$scope.report = report;
			$scope.$watch('report', updateChange.onValueChange, true);
			$controller('LessonsReportWriteCtrl', {
				$scope : $scope
			});

			$controller('LessonsDisplayCtrl', {
				$scope : $scope
			}); // display should be initialized here, we should not show lesson
			// before we can report.
			$rootScope.$broadcast('startLesson', invitation);
		}

		var reportId = $routeParams.reportId;
		if (!!reportId) {
			LergoClient.reports.getById(reportId).then(function(result) {

				initializeReportWriter(result.data);
			});
		} else {
			LergoClient.reports.createFromInvitation(invitation).then(function(result) {
				$location.search('reportId', result.data._id);
				initializeReportWriter(result.data);
			});
		}
	}

	$scope.$watch(function() { // broadcast end of lesson if not next step
		return !!$scope.invitation && !!$scope.hasNextStep && !$scope.hasNextStep();
	}, function(newValue/* , oldValue */) {
		if (!!newValue) {
			$rootScope.$broadcast('endLesson');
			LergoClient.reports.getById($routeParams.reportId).then(function(result) {
				$scope.report = result.data;
				getWrongQuestion($scope.report);
			});
			if (!$scope.invitation.anonymous) {
				LergoClient.reports.ready($routeParams.reportId);
			} else {
				$log.info('not sending report link because anonymous');
			}
		}
	});

	LergoClient.lessonsInvitations.build($routeParams.invitationId, true, false).then(function(result) {
		$scope.invitation = result.data;
		$scope.lesson = result.data.lesson;
		$scope.lesson.image = LergoClient.lessons.getTitleImage($scope.lesson);
		$scope.questions = {};

		initializeReport($scope.invitation);
		var items = result.data.quizItems;
		if (!items) {
			return;
		}
		for ( var i = 0; i < items.length; i++) {
			var item = items[i];
			$scope.questions[item._id] = item;

		}
	}, function(result) {
		if (result.status) {
			$location.path('/errors/notFound');
		}
	});

	$scope.startLesson = function(lessonId) {
		var id = null;
		if (!lessonId) {
			id = $scope.lesson._id;
		} else {
			id = lessonId;
		}
		LergoClient.lessonsInvitations.createAnonymous(id).then(function(result) {
			var invitationId = result.data._id;
			redirectToInvitation(invitationId);
		});
	};
	function redirectToInvitation(invitationId) {
		$location.path('/public/lessons/invitations/' + invitationId + '/display').search({
			reportId : ''
		});
	}

	$scope.absoluteShareLink = function(lesson) {
		$scope.shareLink = window.location.origin + '/#!/public/lessons/' + lesson._id + '/intro';
		$scope.invite = false;
		$scope.share = !$scope.share;
	};
	$scope.showHideInvite = function() {
		$scope.share = false;
		$scope.invite = !$scope.invite;
	};
	$scope.onTextClick = function($event) {
		$event.target.select();
	};
	var lessonLikeWatch = null;
	$scope.$watch('lesson', function(newValue) {
		if (!!newValue) {
			// get my like - will decide if I like this lesson or not
			LergoClient.likes.getMyLessonLike($scope.lesson).then(function(result) {
				$scope.lessonLike = result.data;
			});

			if (lessonLikeWatch === null) {
				lessonLikeWatch = $scope.$watch('lessonLike', function() {
					// get count of likes for lesson
					LergoClient.likes.countLessonLikes($scope.lesson).then(function(result) {
						$scope.lessonLikes = result.data.count;
					});
				});
			}
		}
	});

	$scope.likeLesson = function() {
		$log.info('liking lesson');
		LergoClient.likes.likeLesson($scope.lesson).then(function(result) {
			$scope.lessonLike = result.data;
		});
	};

	$scope.unlikeLesson = function() {
		$log.info('unliking lesson');
		LergoClient.likes.deleteLessonLike($scope.lesson).then(function() {
			$scope.lessonLike = null;
		});
	};

	$scope.isLiked = function() {
		return !!$scope.lessonLike;
	};

	$scope.practiceMistakes = function() {
		createLessonFromWrongQuestions();
	};
	function getWrongQuestion(report) {
		$scope.wrongQuestions = [];
		angular.forEach(report.answers, function(answer) {
			if (!answer.checkAnswer.correct) {
				$scope.wrongQuestions.push(answer.quizItemId);
			}
		});
	}
	function createLessonFromWrongQuestions() {
		if ($scope.wrongQuestions.length > 0) {
			var report = $scope.report;
			LergoClient.lessons.create().then(function(result) {
				var lesson = result.data;
				lesson.name = 'Difficult questions lesson from : ' + report.data.lesson.name;
				// todo: remove filter Service getLanguageByLocale - this should
				// be
				// coming from translate service.
				lesson.language = FilterService.getLanguageByLocale($rootScope.lergoLanguage);
				lesson.steps = [];
				lesson.description = report.data.lesson.description;
				lesson.lastUpdate = new Date().getTime();
				var step = {
					'type' : 'quiz',
					'quizItems' : []
				};
				lesson.steps.push(step);
				lesson.steps[0].quizItems = $scope.wrongQuestions;
				LergoClient.lessons.update(lesson).then(function() {
					$scope.startLesson(lesson._id);
				});
			});
		}

	}

});

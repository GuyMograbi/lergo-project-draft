'use strict';

angular.module('lergoApp').controller('QuestionsUpdateCtrl',
    function ($scope, QuestionsService, LergoClient, $routeParams, ContinuousSave, $log, $location, LergoFilterService, TagsService, $window, $filter) {
        /*$window.scrollTo(0, 0);*/
        document.body.scrollTo(0,0);
        var saveQuestion = new ContinuousSave({
            'saveFn': function (value) {
                return QuestionsService.updateQuestion(value);
            }
        });
        $scope.saveQuestion = saveQuestion;

        var questionId = $routeParams.questionId;

        $scope.types = QuestionsService.questionsType;
        $scope.subjects = LergoFilterService.subjects;
        $scope.languages = LergoFilterService.languages;

        function loadQuestion() {
            QuestionsService.getQuestionById(questionId).then(function (result) {
                $scope.quizItem = result.data;
                // To determine whether advance option should be
                // open or
                // not
                var q = $scope.quizItem;
                $scope.expPerAnsCollapsed = isExpPerAnsCollapsed(q);
                $scope.isCollapsed = (!!q.media || !!q.hint || !!q.explanation || !!q.summary || !!q.explanationMedia || $scope.expPerAnsCollapsed );
                $scope.errorMessage = null;
            }, function (result) {
                $scope.error = result.data;
                $scope.errorMessage = 'Error in fetching questions by id : ' + result.data.message;
                $log.error($scope.errorMessage);
            });
        }

        function isExpPerAnsCollapsed(quizItem) {
            return _.some(quizItem.options, function (option) {
                return !option.checked && !!option.textExplanation;
            });
        }


        if (!!questionId) {
            loadQuestion();
        }

        var lessonsWhoUseThisQuestion = null;
        $scope.showUsedByOthers = function () {
            return lessonsWhoUseThisQuestion !== null && lessonsWhoUseThisQuestion.length > 0;
        };

        function getLessonsWhoUseThisQuestion() {
            $log.info('finding usages');
            LergoClient.lessons.getLessonsWhoUseThisQuestion(questionId || $scope.quizItem._id).then(function (result) {
                lessonsWhoUseThisQuestion = result.data;
            }, function (result) {
                toastr.error('cannot find usages, got error', result.data);
            });
        }

        if (!!questionId || !!$scope.quizItem) {
            $log.info('loading permissions');
            QuestionsService.getPermissions(questionId || $scope.quizItem._id).then(function (result) {

                if (!!$scope.permissions) { // support $parent
                    // scope, update data
                    // inside existing
                    // permissions object
                    _.merge($scope.permissions, result.data);
                } else {
                    $scope.permissions = result.data;
                }

                if (!!$scope.permissions.canEdit) {

                    getLessonsWhoUseThisQuestion();
                }
            });
        }

        $scope.$watch('quizItem', saveQuestion.onValueChange, true);

        // setInterval( function(){ console.log($scope.quizItem)},
        // 1000);

        $scope.getQuestionUpdateTemplate = function () {
            if (!!$scope.quizItem && !!$scope.quizItem.type) {
                var type = QuestionsService.getTypeById($scope.quizItem.type);
                return type.updateTemplate;
            }
            return '';
        };

        $scope.addOption = function (option) {
            if (option === undefined) {
                option = {};
            }
            if ($scope.quizItem.options === undefined) {
                $scope.quizItem.options = [];
            }
            $scope.quizItem.options.push(option);

        };
        $scope.updateAnswer = function ($event, answer, quizItem) {
            if (quizItem.answer === undefined) {
                quizItem.answer = [];
            }
            var checkbox = $event.target;
            if (checkbox.checked) {
                quizItem.answer.push(answer);
            } else {
                quizItem.answer.splice(quizItem.answer.indexOf(answer), 1);
            }
        };
        $scope.isCorrectAnswer = function (answer, quizItem) {
            if (quizItem.answer === undefined) {
                return false;
            }
            return quizItem.answer.indexOf(answer) > -1;
        };

        $scope.removeOption = function (option) {
            $scope.quizItem.options.splice($scope.quizItem.options.indexOf(option), 1);
        };

        TagsService.getAllAvailableTags().then(function (result) {
            $scope.allAvailableTags = result.data;
        });

        $scope.isSaving = function () {
            return !!saveQuestion.getStatus().saving;
        };

        $scope.done = function () {
            $location.path('/user/create/questions');
        };
        $scope.$on('$locationChangeStart', function (event) {   // guy using route change - location change not affect by "reloadOnSearch" flag which is required here.
            if (!!$scope.quizItem && !$scope.isValid($scope.quizItem)) {
                var answer = confirm($filter('translate')('deleteQuestion.Confirm'));
                if (!answer) {
                    event.preventDefault();
                } else {
                    QuestionsService.deleteQuestion(questionId);
                }
            }
        });

        $scope.isValid = function (quizItem) {
            if (!quizItem || !quizItem.type) {
                return false;
            }
            return QuestionsService.getTypeById(quizItem.type).isValid(quizItem);
        };

        $scope.getMediaTemplate = function (quizItem) {
            var type = 'none';
            if (!!quizItem && !!quizItem.media && !!quizItem.media.type) {
                type = quizItem.media.type;
            }
            return 'views/questions/update/media/_' + type + '.html';
        };

        $scope.getExplanationMediaTemplate = function (quizItem) {
            var type = 'none';
            if (!!quizItem && !!quizItem.explanationMedia && !!quizItem.explanationMedia.type) {
                type = quizItem.explanationMedia.type;
            }
            return 'views/questions/update/explanationMedia/_' + type + '.html';
        };

        $scope.canShowExpPerAns = function (quizItem) {
            if (!quizItem || !quizItem.type) {
                return false;
            }
            return QuestionsService.getTypeById(quizItem.type).canShowExpPerAns;
        };


        $scope.getExplanationPerAnswerTemplate = function (quizItem) {
            var type = 'none';
            if (!!quizItem && !!quizItem.type) {
                type = quizItem.type;
            }
            return 'views/questions/update/explanation/_' + type + '.html';
        };

    }
)
;

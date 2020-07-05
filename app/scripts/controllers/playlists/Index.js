'use strict';

angular.module('lergoApp').controller('PlaylistsIndexCtrl', function($scope, $log, LergoClient, $location, $rootScope, $window, localStorageService) {
	// enum
	$scope.LessonTypeToLoad = {
		user : 'myPlaylists',
		liked : 'likedPlaylists'
	};
	$scope.lessonsFilter = {};
	$scope.filterPage = {};
	$scope.totalResults = 0;
	$scope.lessonsFilterOpts = {
		'showSubject' : true,
		'showLanguage' : true,
		'showAge' : true,
		'showViews' : true,
		'showTags' : true,
		'showSearchText' : true
	};

	$scope.load = function(lessonToLoad) {
		var oldValue = localStorageService.get('lessonToLoad');
		if (oldValue !== lessonToLoad) {
			localStorageService.set('lessonToLoad', lessonToLoad);
			$scope.filterPage.current = 1;
			$scope.filterPage.updatedLast = new Date().getTime();
		}
    };

    $scope.playlist1 = 
        [
            {"_id" : "536df82d634d2fc25445ee39", "name" : "playlist number 1 test" },
            {"_id" : "5eba8713011aee65253b74ae", "name" : "no-name"},
            {"_id" : "5d23fce0ef7df85ff68cae07", "name": "Japanese II Vocabulary - Part 2 (7 - 12)"},
            {"_id" : "5d050600ef7df85ff68c8de9", "name": "GENKI - 1 - lesson 3"}
        ]

    $scope.playlist2 = 
        [
            {"_id" : "536df82d634d2fc25445ee39", "name" : "playlist number 1 test" },
            {"_id" : "5eba8713011aee65253b74ae", "name" : "no-name"},
            {"_id" : "5d23fce0ef7df85ff68cae07", "name": "Japanese II Vocabulary - Part 2 (7 - 12)"},
            {"_id" : "5d050600ef7df85ff68c8de9", "name": "GENKI - 1 - lesson 3"}
        ]
    
    $scope.playlist3 = 

        [
            {"_id" : "536df82d634d2fc25445ee39", "name" : "playlist number 1 test" },
            {"_id" : "5eba8713011aee65253b74ae", "name" : "no-name"},
            {"_id" : "5d23fce0ef7df85ff68cae07", "name": "Japanese II Vocabulary - Part 2 (7 - 12)"},
            {"_id" : "5d050600ef7df85ff68c8de9", "name": "GENKI - 1 - lesson 3"}
        ]
        
    $scope.playlists = 
        [
            $scope.playlist1[0], $scope.playlist2[1], $scope.playlist3[2]
        ]    

	$scope.loadLessons = function() {
		$log.info('loading lessons');
		var queryObj = {
			'filter' : _.merge({}, $scope.lessonsFilter),
			'sort' : {
				'lastUpdate' : -1
			},
			'dollar_page' : $scope.filterPage
		};
		$scope.lessonToLoad = localStorageService.get('lessonToLoad');
		var getLessonsPromise = null;
		if ($scope.lessonToLoad === $scope.LessonTypeToLoad.liked) {
			getLessonsPromise = LergoClient.userData.getLikedLessons(queryObj);
		} else {
			getLessonsPromise = LergoClient.userData.getLessons(queryObj);
			$scope.lessonToLoad = $scope.LessonTypeToLoad.user;
		}

		getLessonsPromise.then(function(result) {
			$scope.lessons = result.data.data;
			$scope.filterPage.count = result.data.count; // number of lessons
			// after filtering
			// .. changing
			// pagination.
			$scope.totalResults = result.data.total;
			$scope.errorMessage = null;
			$log.info('Lesson fetched successfully');
			scrollToPersistPosition();
		}, function(result) {
			$scope.errorMessage = 'Error in fetching Lessons : ' + result.data.message;
			$log.error($scope.errorMessage);
		});
	};

	$scope.create = function() {
        $scope.createLessonBtnDisable=true;
		LergoClient.lessons.create().then(function(result) {
			var lesson = result.data;
			$scope.errorMessage = null;
			$location.path('/user/lessons/' + lesson._id + '/update');
		}, function(result) {
			$scope.errorMessage = 'Error in creating Lesson : ' + result.data.message;
			$log.error($scope.errorMessage);
            $scope.createLessonBtnDisable=false;
		});
	};

	var path = $location.path();
	$scope.$on('$locationChangeStart', function() {
		persistScroll($scope.filterPage.current);
	});

	$scope.$watch('filterPage.current', function(newValue, oldValue) {
		if (!!oldValue) {

			persistScroll(oldValue);
		}
	});
	function persistScroll(pageNumber) {
		if (!$rootScope.scrollPosition) {
			$rootScope.scrollPosition = {};
		}
		$rootScope.scrollPosition[path + ':page:' + pageNumber] = $window.scrollY;
	}
	function scrollToPersistPosition() {
		var scrollY = 0;
		if (!!$rootScope.scrollPosition) {
			scrollY = $rootScope.scrollPosition[path + ':page:' + $scope.filterPage.current] || 0;
		}
		$window.scrollTo(0, scrollY);
	}
});
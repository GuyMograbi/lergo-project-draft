'use strict';

angular.module('lergoApp').controller('PlaylistsIndexCtrl', function($scope, $log, LergoClient, $location, $rootScope, $window, localStorageService) {
	// enum
	$scope.PlaylistTypeToLoad = {
		user : 'myPlaylists',
		liked : 'likedPlaylists'
	};
	$scope.playlistsFilter = {};
	$scope.filterPage = {};
	$scope.totalResults = 0;
	$scope.playlistsFilterOpts = {
		'showSubject' : true,
		'showLanguage' : true,
		'showAge' : true,
		'showViews' : true,
		'showTags' : true,
		'showSearchText' : true
	};

	$scope.playlistToShow = $scope.playlists;

	// Jeff: we need to have the users completed lessons ( get them all, it's the easiest approach to start with)
	$scope.GetRowIndex = function (index) {
		var queryObj = {
			'filter' : _.merge({}, $scope.playlistsFilter),
			'sort' : {
				'lastUpdate' : -1
			},
			'dollar_page' : $scope.filterPage
		};
		$scope.playlistToShow = $scope.playlists[index];
		// list is an array of lesson_id's belonging to the specified playlist
		var list = $scope.playlistToShow.steps[0].quizItems;
		console.log('the number  of lessons in a playlist is: ', list.length);
		LergoClient.lessons.findLessonsById(list)
		.then(function (result) {
			var newObj = {};
			for (var i = 0; i < result.data.length; i++) {
				newObj[result.data[i]._id] = result.data[i];
			}
			$scope.quizItemsData = newObj;
		})
		.then(LergoClient.userData.getCompletedLessons(queryObj)
		.then(function(result) {
			$scope.myCompletedLessons = result.data.data;
			$log.info('All ', $scope.myCompletedLessons.length,' of my Completed Lessons fetched successfully',  );
		}))
		.catch(function(err) {
			console.log('Handle error', err); 
		})	
	};
	
	
 
	$scope.load = function(playlistToLoad) {
		var oldValue = localStorageService.get('playlistToLoad');
		if (oldValue !== playlistToLoad) {
			localStorageService.set('playlistToLoad', playlistToLoad);
			$scope.filterPage.current = 1;
			$scope.filterPage.updatedLast = new Date().getTime();
		}
	};

	$scope.loadPlaylists = function() {
		$log.info('loading playlists');

		var queryObj = {
			'filter' : _.merge({}, $scope.playlistsFilter),
			'sort' : {
				'lastUpdate' : -1
			},
			'dollar_page' : $scope.filterPage
		};
		$scope.playlistToLoad = localStorageService.get('playlistToLoad');
		var getPlaylistsPromise = null;
		if ($scope.playlistToLoad === $scope.PlaylistTypeToLoad.liked) {
			getPlaylistsPromise = LergoClient.userData.getLikedPlaylists(queryObj);
		} else {
			getPlaylistsPromise = LergoClient.userData.getPlaylists(queryObj);
			$scope.playlistToLoad = $scope.PlaylistTypeToLoad.user;
		}

		getPlaylistsPromise.then(function(result) {
			$scope.playlists = result.data.data;
			$scope.filterPage.count = result.data.count; // number of playlists
			// after filtering
			// .. changing
			// pagination.
			$scope.totalResults = result.data.total;
			$scope.errorMessage = null;
			$log.info('Playlist fetched successfully');
			scrollToPersistPosition();
		}, function(result) {
			$scope.errorMessage = 'Error in fetching Playlists : ' + result.data.message;
			$log.error($scope.errorMessage);
		});
	};

	$scope.create = function() {
        $scope.createPlaylistBtnDisable=true;
		LergoClient.playlists.create().then(function(result) {
			var playlist = result.data;
			$scope.errorMessage = null;
			$location.path('/user/playlists/' + playlist._id + '/update');
		}, function(result) {
			$scope.errorMessage = 'Error in creating Playlist : ' + result.data.message;
			$log.error($scope.errorMessage);
            $scope.createPlaylistBtnDisable=false;
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
	$scope.quizItemsData = {};
	$scope.getLesson = function (item) {
		if ($scope.quizItemsData.hasOwnProperty(item)) {
			return $scope.quizItemsData[item].name;
		}
		return null;
	};
	// jeff: used for lessonIsDone
	$scope.getLessonObject = function (item) {
		if ($scope.quizItemsData.hasOwnProperty(item)) {
			return $scope.quizItemsData[item];
		}
		return null;
	};
	$scope.startingState = 'false';
	$scope.lessonIsDone = function(lesson) {
		lesson.isComplete = !lesson.isComplete;
		if (lesson.isComplete) {
			LergoClient.completes.lessonIsComplete(lesson).then(function (result) {
                $scope.lessonIsComplete = result.data;
            });
		} else {
			LergoClient.completes.deleteLessonIsComplete(lesson).then(function () {
                $scope.lessonIsComplete = null;
            });
		}
		console.log('this lesson has been complete:', lesson.name, lesson.isComplete);
	};


});

(function() {
	'use strict';
	var videoApp = angular.module('videoApp', []);
    
	videoApp.service('videoService', function() {
		return {
			library: [],
			currentVideo: void 0,
			player: void 0,
            intro: [],
            introColor: ["#ff5b2e", "#4873fe", "#04c603", "#ffa300", "#8f39d2"]
		};
	});

	videoApp.controller('bodyController', ['$scope', '$timeout', '$compile', 'videoService', function($scope, $timeout, $compile, videoService) {
		$scope.videoService = videoService;
		$scope.videoOnPlay  = false;
        $scope.videoSound = true;
        $scope.introCount = 1;
        $scope.colorCount = 0;

		$scope.videoURL = {
			url: function(urlAddress) {
				if (angular.isDefined(urlAddress) && angular.isDefined(urlAddress.split("v=")[1].substring(0, 11))) {
					$scope.videoID = urlAddress.split("v=")[1].substring(0, 11);
                    
					videoService.library.push({
						'url': urlAddress,
						'id': $scope.videoID,
						'thumb': 'http://i.ytimg.com/vi/' + $scope.videoID + '/default.jpg',
                        'time': $scope.videoDuration
					});
				}
			}
		};

		$scope.addNew = function() {
            if(videoService.library.length < 10){
                videoService.currentVideo = void 0;
                $scope.videoOnPlay        = false;
                $scope.videoSound         = true;
            }else{
                window.alert("You Reached the limits");
            }
		};
        
        $scope.addIntro = function() {
            if(videoService.intro.length < 10 ){
                videoService.currentVideo = void 0;
                videoService.intro.push({
                    'color': videoService.introColor[$scope.colorCount],
                    'count': $scope.introCount++
                });
                $scope.colorCount++;
                if($scope.colorCount >= videoService.introColor.length){
                    $scope.colorCount = 0;
                }
                $scope.renderVideo($scope.videoID);
            }else{
                window.alert("You Reached the limits");
            }
        };
        
        $scope.linkCancel = function() {
            videoService.currentVideo = ! videoService.currentVideo;
        };
        
		$scope.renderVideo = function(videoID) {
			videoService.currentVideo = videoID;
			$timeout(function() {
				loadYoutubePleyer(videoID);
			}, 100);
		};
        
        $scope.formatTime = function(time) {
            time = Math.round(time);
            var minutes = Math.floor(time / 60),
                seconds = time - minutes * 60;
            seconds = seconds < 10 ? '0' + seconds : seconds;
            
            return minutes + ":" + seconds;
        };

		$scope.playVideo = function() {
			if (! $scope.videoOnPlay) { videoService.player.playVideo(); }
			else { videoService.player.pauseVideo(); }
            
			$scope.videoOnPlay = ! $scope.videoOnPlay;
		};
        
        $scope.mute = function() {
            if (! $scope.videoSound) { videoService.player.unMute(); }
            else { videoService.player.mute(); }
            
            $scope.videoSound = ! $scope.videoSound;
        };
        
		var loadYoutubePleyer = function(videoID) {
			videoService.player = new YT.Player('player', {
				height: '370',
				width: '650',
				videoId: '',
				playerVars: {
				    'autoplay': 0,
				    'enablejsapi': 1,
				    'controls': 0,
				    'showinfo': 0,
				    'rel': 0,
				    'showsearch': 0,
				    'modestbranding': 0
				},
				events: {
				    'onReady': function(ev) { $scope.cueVideo(videoID); },
                    'onPlayerStateChange': function(ev) {
                        $scope.getDur = videoService.player.getDuration();
                        $scope.videoDuration = $scope.formatTime($scope.getDur);
                    }
				}
			});
		};

		$scope.cueVideo = function(videoID) {
			if (! videoService.currentVideo) {
				$scope.renderVideo(videoID);
				return;
			}

			$scope.videoOnPlay = false;
            $scope.videoSound = true;
			videoService.player.cueVideoById(videoID);
		};
        
		window.onYouTubeIframeAPIReady = function() {}; 
	}]);

	videoApp.directive('thumbs', ['videoService', function(videoService) {
		return {
			restrict: 'E',
            templateUrl: 'libraryThumbTemplate',
            controller: function ($scope) {
            	$scope.removeData = function(hashKey) {
            		angular.forEach(videoService.library, function(object, index) {
            			if (object.$$hashKey === hashKey) {
            				if (object.id === videoService.currentVideo) {
            					videoService.currentVideo = void 0;
            				}
            				videoService.library.splice(index, 1);
            				return;
            			}
            		});
            	}
            },
        }
	}]);
    
    videoApp.directive('intro', ['videoService', function(videoService) {
        return {
            restrict: 'E',
            templateUrl: 'introSelectTemplate',
            controller: function($scope) {
                var countColor = 0;
                $scope.changeColor = function(changeKey) {
                    angular.forEach(videoService.intro, function(object, index) {
                        if(object.$$changeKey === changeKey){
                            if(countColor >= videoService.introColor.length){
                                countColor = 0;
                            }
                            $scope.change = videoService.introColor[countColor];
                            videoService.intro[object].color = $scope.change;
                            countColor++;
                            return;
                        }
                    });
                }
            },
        }
    }]);

	angular.bootstrap(document.querySelector("html"), ["videoApp"]);
})();
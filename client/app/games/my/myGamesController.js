(function(){
	angular.module('imgame.myGames', [])
	  .controller('MyGamesController', MyGamesController);

  function MyGamesController($scope, $window, $location, Auth, GamePost){
  	$scope.myGames = [];

    Auth.requireAuth();

  	var getMyGames = function(){
  		GamePost.myGames()
  			.then(function(games){
  				console.log(games);
  			});
  	}
  	$scope.myGames = getMyGames();
  };

})();
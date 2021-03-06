describe('ProfileController', function(){
  beforeEach(module('imgame'));

  var ctrl, scope, http, Profile;

  beforeEach(inject(function($controller, $rootScope, $httpBackend, _Profile_, $q){
  	scope = $rootScope.$new();
  	http = $httpBackend;
  	Profile = _Profile_;

  	ctrl = $controller('ProfileController', {
  		$scope: scope,
      $http: http,
      Profile: Profile,
      $route: { 
      		current: {
      			params: {
      				id: 1
      			}
      		}
      	}
  	});

  	spyOn(Profile, "getRecentGames").and.returnValue($q.when({}));
  	spyOn(Profile, "updateProfile").and.returnValue($q.when({}));
  	spyOn(Profile, "getReviews").and.returnValue($q.when({}));
  }));

  describe("$scope.getRecentGames", function(){
		it("should be defined", function(){
			expect(scope.getRecentGames).toBeDefined();
		});
		it("should call Profile.getRecentGames", function(){
			scope.getRecentGames();
			expect(Profile.getRecentGames).toHaveBeenCalled();
		});
		//test that recent games is populated correctly
	});

	describe("$scope.close", function(){
		it("should be defined", function(){
			expect(scope.close).toBeDefined();
		})
	});

	describe("$scope.updateProfile", function(){
		it("should be defined", function(){
			expect(scope.updateProfile).toBeDefined();
		});
		it("should call Profile.updateProfile", function(){
			scope.updateProfile();
			expect(Profile.updateProfile).toHaveBeenCalled();
		})
		//check that $scope.myProfile & $scope.savedProfile gets set in then
	});	

	describe("$scope.showInput", function(){
		it("should be defined", function(){
			expect(scope.showInput).toBeDefined();
		});
		it("should set $scope.update to true if !$scope.myProfile", function(){
			scope.myProfile = false;
			scope.showInput();
			expect(scope.update).toBe(true);
		});
		it("should set $scope.update to true if !$scope.myProfile.viewId", function(){
			scope.myProfile = {};
			scope.myProfile.viewId = undefined;
			scope.showInput();
			expect(scope.update).toBe(true);		
		});
		it("it not set $scope.update if $scope.myProfile", function(){
			scope.update = null;
			scope.myProfile = {};
			scope.myProfile.viewId = 1;
			scope.showInput();
			expect(scope.update).toBeNull();		
		})
	});

	describe("$scope.openRateModal", function(){
		it("should be defined", function(){
			expect(scope.openRateModal).toBeDefined();
		});
		it("should set currentRateGame to game argument", function(){
			var game = {
				host_id: 1,
				host_name: "Ignacio Prado",
				host_pic: "http://ignacio.jpg",
				playerPics: []
			}
			scope.openRateModal(game);
			expect(scope.currentRateGame).toEqual(game);
		});
	});

	describe("$scope.getReviews", function(){
		it("should be defined", function(){
			expect(scope.getReviews).toBeDefined();
		});
		it("should call Profile.getReviews", function(){
			scope.getReviews();
			expect(Profile.getReviews).toHaveBeenCalled();
		});
		//test that then block populates scope.existingReviews
	});

	describe("$scope.sendReviews", function(){
		it("should be defined", function(){
			expect(scope.sendReviews).toBeDefined();
		});

	})

})
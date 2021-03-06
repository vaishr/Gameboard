(function(){
 angular.module('imgame')
  .directive('googleMaps', ['$rootScope', googleMaps]);

  function googleMaps($rootScope) {
    // directive link function
    var link = function(scope, element, attrs) {      
      // map config function
      var geocoder = new google.maps.Geocoder();
      var service = new google.maps.DistanceMatrixService;
      var infoWindow = {};    
      var currInfoMarker;
      var searchMarkers = [];
      var clickMarker = null;
      var GeoMarker;
      var mapOptions = {
        center: {lat: 30.2500, lng: -97.7500},
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
      var map;

      // current location icon set up
      var currIcon = {
        url: 'assets/gpsloc.png',
        size: new google.maps.Size(34, 34),
        scaledSize:new google.maps.Size(17,17)
      };

      // Create the search box and link it to the UI element.
      var input = document.getElementById('pac-input');
      var searchBox = input && new google.maps.places.SearchBox(input);

      function initMap() {
        var bounds;
        scope.currentLocation = $rootScope.currentLocation;
        map = new google.maps.Map(document.getElementById('gmap'), mapOptions);
        input && map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
        
        // In case rootscope did not get current location, request current location and set current location on map
        if ((!scope.currentLocation || $rootScope.currentLocation) && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function (position) {
            // add current location dot
            $('#pac-input') && $('#pac-input').show();
            // store currentLocation and center map around it and pop up info window
            scope.currentLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            $rootScope.currentLocation = scope.currentLocation;

            // center current location and also make sure current location always show on map
            input && map.setCenter(scope.currentLocation);
            
            bounds = new google.maps.LatLngBounds(scope.currentLocation);
            // add current location dot
            new google.maps.Marker({
              position: scope.currentLocation,
              map: map,
              icon: currIcon
            }); 
          });
        } else {
          $('#pac-input') && $('#pac-input').show() && map.setCenter(scope.currentLocation);
          // center current location and also make sure current location always show on map
          new google.maps.Marker({
            position: scope.currentLocation,
            map: map,
            icon: currIcon
          });
          bounds = new google.maps.LatLngBounds(scope.currentLocation);
          bounds.extend(scope.currentLocation);
          map.fitBounds(bounds);   
        }  

        function clearMaker () {
          searchMarkers.forEach(function(marker){
              marker.setMap(null);
            });
          clickMarker && clickMarker.setMap(null); 
        };              

        ////////
        // create game page use only
        ////////
        if (input) {
          // Bias the SearchBox results towards current map's viewport.
          map.addListener('bounds_changed', function() {
            searchBox.setBounds(map.getBounds());
          });
          
          // searchbox listener, place marker on map and listen to clicks
          searchBox.addListener('places_changed', function() {
            var places = searchBox.getPlaces();
            if (places.length === 0) return;

            // clear all the current markers on the map
            clearMaker();       

            // add places the match the search ont the map
            places.forEach(function(place) {
              var newMark = new google.maps.Marker({
                map: map,
                position: place.geometry.location
              });
              searchMarkers.push(newMark);

              // bounds view based on seach
              if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
              } else {
                bounds.extend(place.geometry.location);
              }

              // add listener to show info window of the marker that was clicked
              google.maps.event.addListener(newMark, 'click', function(){
                infoWindow.close && infoWindow.close();
                showInfoWindow([place.geometry.location], place, newMark);
              })
            })

            map.fitBounds(bounds);
            map.panToBounds(bounds); 
          });
          // searchBox listener complete
  
          // event listener that set the marker as the clicked point on the map
          google.maps.event.addListener(map, 'click', function(event) { 
            searchMarkers.forEach(function(marker){
              marker.setMap(null);
            });
            clickMarker && clickMarker.setMap(null);
            changeMarker(event.latLng, map);
            document.getElementById('pac-input').value = "";
          });
        }

        // display games markers on map in Browse Game page
        scope.$watch('newGames', function() {
          if (scope.newGames && scope.newGames.length > 0) {
            //map.setCenter(scope.currentLocation);
            bounds = new google.maps.LatLngBounds(scope.currentLocation);
            clearMaker(); 
            scope.newGames.forEach(function(game){              
              if (game.lat){
                game.location = new google.maps.LatLng(Number(game.lat), Number(game.lng));                
                var image = "<img src='/assets/facebook.png'>";
                var newMark = new google.maps.Marker({
                  map: map,
                  animation: google.maps.Animation.DROP,
                  position: game.location,
                  title: game.game
                 // ,icon: image
                });
                searchMarkers.push(newMark);
                bounds.extend(game.location);
                scope.currentLocation && bounds.extend(scope.currentLocation);
                map.fitBounds(bounds);                  

                // add listener to show info window of the marker that was clicked
                google.maps.event.addListener(newMark, 'click', function(){
                  if (scope.games) {
                    scope.getRequestInfo(game.id)
                    $("#openRequest").openModal();
                    scope.openGame(game);
                  } else {
                    scope.showHostedEventModal({data: game});
                  }
                })
                return true
              } else {
                return false;
              }
            })            
          }
        });
      };
      // initMap func complete
      
      // make the inforWindow html template
      function makeInfoHtml (name, distance) {
        var nameTag = name || '';
        if (name !== 'name' || name == undefined) {
          nameTag = '<div><strong>'+nameTag+'</strong></div>';
        }
        return nameTag + '<div><strong>Distance:</strong> ' + distance + '</div>' +
          '<a target="_blank" href="https://www.google.com/maps/dir/' + scope.currentAddress.split(" ").join("+") + "/" + scope.game.location.split(" ").join("+")  +'">more info' + '</a>';
      };

      /////////////
      // get the distance between current location and marker, and initiate infoWindow
      // destinations is an array of locations with latLng
      // makerPlace is an object with name and formatted_address
      // marker is the marker that the infoWindow attached to 
      function showInfoWindow(destinations, markerPlace, marker) {
        // populate the game location form on location input
        var name = '';
        if(markerPlace.name) {
          scope.game.business = markerPlace.name;
        }

        scope.game.lat = markerPlace.geometry.location.lat();
        scope.game.lng = markerPlace.geometry.location.lng();
        scope.game.location = markerPlace.formatted_address;  

        document.getElementById('game-location').value = markerPlace.formatted_address;  

        // send request to get distance between current location and destination    
        service.getDistanceMatrix({
          origins: [scope.currentLocation],
          destinations: destinations,
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.IMPERIAL
        }, function(res, status){
          if (status !== google.maps.DistanceMatrixStatus.OK) {
            alert('Error was: ' + status);
          } else {
            scope.currentAddress = res.originAddresses[0];
            var distanceObj = res.rows[0].elements[0];
            var info = makeInfoHtml(markerPlace.name, distanceObj.distance.text);
            // add info window with distance and time for each pin drop on map
            infoWindow = new google.maps.InfoWindow({
                content: info
              });
            currInfoMarker = marker;
            infoWindow.open(map, marker);
            // add info window complete
          }

        });
      };

      // this is for clickMarker only, when click on the map, erase all other markers and only show clicked location with an infoWindow
      function changeMarker (location, map) {
        // clean the previous clicked marker
        clickMarker && clickMarker.setMap(null);

        // Add the marker at the clicked location, and add the next-available label
        // from the array of alphabetical characters.
        geocoder.geocode({'latLng': location}, function(results, status) {      
          clickMarker = new google.maps.Marker({
            position: location,
            map: map
          });

          if(status == google.maps.GeocoderStatus.OK) {
            if(results[0]) {
              var markerPlace = results[0];
            }
          }
          showInfoWindow([location], markerPlace, clickMarker);
        });
      };

      /////////////////////////
      // listen DOM to init MAP;
      // if (document.getElementById('gmap') && document.getElementById('pac-input')) {
      //   console.log("document.getElementById('pac-input')", document.getElementById('pac-input'))
      //   initMap();    
      //     //google.maps.event.addDomListener(window, 'load', initMap);                       
      // }

      //Event listeners for browse game
      if (scope.games) {
        scope.$watchGroup(['startTimeFilter', 'endTimeFilter', 'startDateFilter', 'endDateFilter', 'distance', 'searchText'], function(){
          scope.newGames = scope.games.filter(function(game){
            return (scope.dateFilter(game.game_datetime) && scope.disFilter(game.distance) && scope.timeFilter(game.game_datetime) && scope.nameFilter(game.game));
          })
          initMap();
        }, true); 
      }

      initMap();                      

    };

    return {
      link: link
    };
  };

})();
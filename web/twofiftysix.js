"use strict";
/*globals angular,window*/

window.twoFiftySix = {
   controllers: {},
   directives: {}
};
twoFiftySix.app = angular.module('twoFiftySix', []);


twoFiftySix.app.directive('eightBitPanel', function($compile) {
   return {
      restrict: 'A',
      transclude:true,
      template: '<div class="tl"></div><div class="tr"></div><div class="bl"></div><div class="br"></div><div class="content"  ng-transclude></div>',
      link: function (scope, element, attrs) {
         element.addClass('ebp');
         var compiled = $compile('')(scope);
         element.append(compiled);
      }
   };
});

//

twoFiftySix.app.factory('game', function($q,$rootScope){
   return {
      files:[
         "/images/animation.png",
         "/images/characters.png",
         "/images/creatures.png",
         "/images/environment.png",
         "/images/equipment.png",
         "/images/items.png",
         "/images/ui.png"
      ],
      maps: _.keys(eburp.getMaps()),
      currentMap: 19,
      loader: new eburp.ResourceLoader(),
      bindInput: function(){
         var self = this;
         $(document).keyup(function(e){
            switch(e.keyCode){
               case 37: // Left
                  self.sprite.velocity.x = 0;
                  break;
               case 38: // Up
                  self.sprite.velocity.y = 0;
                  break;
               case 39: // Right
                  self.sprite.velocity.x = 0;
                  break;
               case 40: // Down
                  self.sprite.velocity.y = 0;
                  break;
               default:
                  return true;
            }
            e.stopImmediatePropagation();
         });
         $(document).keydown(function(e){
            switch(e.keyCode){
               case 37: // Left
                  self.sprite.moveLeft();
                  break;
               case 38: // Up
                  self.sprite.moveUp();
                  break;
               case 39: // Right
                  self.sprite.moveRight();
                  break;
               case 40: // Down
                  self.sprite.moveDown();
                  break;
               default:
                  return true;
            }
            e.stopImmediatePropagation();
         });
      },
      load : function(){
         var deferred = $q.defer();
         var self = this;
         this.loader.loadAll(this.files,function(){
            self.scene = new eburp.Scene({autoStart: true});
            self.tileMap = new eburp.TileMap(self.maps[self.currentMap]);
            self.sprite = new eburp.MovableTileObject({
               point: self.tileMap.bounds.getCenter()
            });
            self.scene.addObject(self.sprite);
            self.scene.addObject(self.tileMap);

            deferred.resolve();
            if (!$rootScope.$$phase) {
               $rootScope.$apply();
            }
         });
         return deferred.promise;
      },
      getCurrentMapName: function(){
        if(!this.tileMap || !this.tileMap.map){
           return null;
        }
        return this.tileMap.map.name;
      },
      /**
       * Guess a good starting point for a player in a new map.
       *
       * Try to get a transition feature (door or exit), then
       * fall back to the map center.
       */
      setMapSpawn: function(mapName) {
         this.tileMap.setMap(mapName);
         var map = this.tileMap.map;
         var point = new eburp.Point(0,0);
         if(map){
            point = this.tileMap.bounds.getCenter();
            if(map.features){
               // Pick the first transition feature we find.
               var feature = _.where(this.tileMap.map.features,{type : "transition"})[0];
               if(feature){
                  point = new eburp.Point(feature.x,feature.y);
               }
            }
         }
         this.sprite.point = point;
         //self.tileMap.bounds.getCenter()
      },
      nextMap: function(){
         var curr = this.currentMap;
         var next = curr + 1;
         if(next >= this.maps.length){
            next = 0;
         }
         this.currentMap = next;
         this.setMapSpawn(this.maps[next]);
      },
      previousMap : function(){
         var curr = this.currentMap;
         var next = curr - 1;
         if(next < 0){
            next = this.maps.length - 1;
         }
         this.currentMap = next;
         this.setMapSpawn(this.maps[next]);
      }

   }
});

twoFiftySix.app.controller('twoFiftySixApp',function($scope,$rootScope,$http,game){
   $scope.hasImage = false;

   $scope.shareImage = function(){
      $http.post('/share', {data:game.imageData}).success(function(data){
         $scope.sharedUrl = data.url;
         $scope.clearImageData();
      });
   };
   $scope.clearImageData = function() {
      $scope.hasImage = false;
      game.imageData = null;
      localStorage.removeItem("sharedImage");
   };
   $scope.setImageData = function(data){
      if(!data){
         return $scope.clearImageData();
      }
      localStorage.setItem("sharedImage",data);
      game.imageData = data;
      $scope.hasImage = true;
   };
   $scope.getImageData = function(){

      return localStorage.getItem("sharedImage");
   };
   $scope.syncImageData = function(){
      $scope.setImageData($scope.getImageData());
   };

   $scope.nextMap = function(){
      game.nextMap();
      $scope.mapName = game.getCurrentMapName();
   };
   $scope.previousMap = function(){
      game.previousMap();
      $scope.mapName = game.getCurrentMapName();
   };
   game.load().then(function(){
      $scope.mapName = game.getCurrentMapName();
   });

});




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
      state:'Uninitialized',
      listeners:[],
      currentMap: 15,
      loader: new eburp.ResourceLoader(),
      load : function(){
         var deferred = $q.defer();
         var self = this;
         this.listeners.push(deferred);
         function done(){
            _.defer(function(){
               var listeners = self.listeners;
               self.listeners = [];
               $rootScope.$apply(function(){
                  angular.forEach(listeners,function(l){
                     l.resolve();
                  });
               });
            });
         }
         if(this.state === 'Loaded'){
            done();
            return deferred.promise;
         }
         else if(this.state === 'Loading'){
            return deferred.promise;
         }
         this.state = 'Loading';
         self.world = new eburp.World({
            scene:new eburp.Scene({
               autoStart: true,
               debugRender:true
            })
         });
         self.scene = self.world.scene;
         self.input = self.scene.input = self.world.input;
         self.tileMap = new eburp.TileMap(self.maps[self.currentMap]);
         self.scene.addObject(self.tileMap);

         // Create a movable character with basic components.
         self.sprite = new eburp.TileObject({
            point: self.tileMap.bounds.getCenter(),
            icon:"party.png"
         });
         self.sprite.addComponent(new eburp.CollisionComponent());
         self.sprite.addComponent(new eburp.TilePartyComponent());
         self.scene.addObject(self.sprite);

         this.loader.load(this.files,function(){
            self.state = 'Loaded';
            return done();
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
            this.sprite.setPoint(point);
            if(this.tileView && map.width < 10 && map.height < 10){
               this.tileView.camera.point.zero();
               this.tileView.trackObject(null);
            }
            else if(this.tileView && this.sprite) {
               this.tileView.trackObject(this.sprite);
            }
            return;
         }
         this.sprite.setPoint(point);
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
   var stateKey = "_testPow2State";
   $scope.saveState = function(data){
      localStorage.setItem(stateKey,data);
   };
   $scope.clearState = function() {
      localStorage.removeItem(stateKey);
   };
   $scope.getState = function(){
      return localStorage.getItem(stateKey);
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




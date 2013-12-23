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
               debugRender:false
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


twoFiftySix.app.directive('gameView', function ($compile, game) {
   return {
      restrict: 'A',
      link: function ($scope, element, attrs) {
         $scope.canvas = element[0];
         var context = $scope.canvas.getContext("2d");
         context.webkitImageSmoothingEnabled = false;
         context.mozImageSmoothingEnabled = false;
         game.load().then(function () {

            // Inspired by : http://seb.ly/2011/04/multi-touch-game-controller-in-javascripthtml5-for-ipad/
            $scope.canvas.addEventListener('touchstart', onTouchStart, false);
            $scope.canvas.addEventListener('touchmove', onTouchMove, false);
            $scope.canvas.addEventListener('touchend', onTouchEnd, false);
            window.addEventListener('resize',onResize,false);

            /**
             * Game analog input
             */
            var halfWidth = $scope.canvas.width / 2;
            game.world.input.touchId = -1;
            game.world.input.touchCurrent = new eburp.Point(0, 0);
            game.world.input.touchStart = new eburp.Point(0, 0);
            game.world.input.analogVector = new eburp.Point(0, 0);


            function relTouch(touch){
               var canoffset = $($scope.canvas).offset();
               touch.gameX = touch.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
               touch.gameY = touch.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;
               return touch;
            }

            var $window = $(window);
            function onResize(){
               context.canvas.width = $window.width();
               context.canvas.height = $window.height();
               context.webkitImageSmoothingEnabled = false;
               context.mozImageSmoothingEnabled = false;
            }

            /*
             *	Touch event (e) properties :
             *	e.touches: 			Array of touch objects for every finger currently touching the screen
             *	e.targetTouches: 	Array of touch objects for every finger touching the screen that
             *						originally touched down on the DOM object the transmitted the event.
             *	e.changedTouches	Array of touch objects for touches that are changed for this event.
             *						I'm not sure if this would ever be a list of more than one, but would
             *						be bad to assume.
             *
             *	Touch objects :
             *
             *	identifier: An identifying number, unique to each touch event
             *	target: DOM object that broadcast the event
             *	clientX: X coordinate of touch relative to the viewport (excludes scroll offset)
             *	clientY: Y coordinate of touch relative to the viewport (excludes scroll offset)
             *	screenX: Relative to the screen
             *	screenY: Relative to the screen
             *	pageX: Relative to the full page (includes scrolling)
             *	pageY: Relative to the full page (includes scrolling)
             */
            function onTouchStart(e) {
               _.each(e.touches,function(t){relTouch(t)});
               _.each(e.changedTouches,function(t){relTouch(t)});
               for (var i = 0; i < e.changedTouches.length; i++) {
                  var touch = e.changedTouches[i];
                  if (game.world.input.touchId < 0) {
                     game.world.input.touchId = touch.identifier;
                     console.log(touch.gameX);
                     game.world.input.touchStart.set(touch.gameX, touch.gameY);
                     game.world.input.touchCurrent.copy(game.world.input.touchStart);
                     game.world.input.analogVector.zero();
                  }
               }
               game.world.input.touches = e.touches;
            }

            function onTouchMove(e) {
               // Prevent the browser from doing its default thing (scroll, zoom)
               e.preventDefault();
               _.each(e.touches,function(t){relTouch(t)});
               _.each(e.changedTouches,function(t){relTouch(t)});
               for (var i = 0; i < e.changedTouches.length; i++) {
                  var touch = e.changedTouches[i];
                  if (game.world.input.touchId == touch.identifier) {
                     game.world.input.touchCurrent.set(touch.gameX, touch.gameY);
                     game.world.input.analogVector.copy(game.world.input.touchCurrent);
                     game.world.input.analogVector.subtract(game.world.input.touchStart);
                     break;
                  }
               }
               game.world.input.touches = e.touches;
            }

            function onTouchEnd(e) {
               _.each(e.touches,function(t){relTouch(t)});
               _.each(e.changedTouches,function(t){relTouch(t)});
               game.world.input.touches = e.touches;
               for (var i = 0; i < e.changedTouches.length; i++) {
                  var touch = e.changedTouches[i];
                  if (game.world.input.touchId == touch.identifier) {
                     game.world.input.touchId = -1;
                     game.world.input.analogVector.zero();
                     break;
                  }
               }
            }

            game.tileView = new eburp.TileMapView(element[0], game.loader);
            game.tileView.camera.extent.set(10, 10);
            game.tileView.tileMap = game.tileMap;
            game.scene.addView(game.tileView);
            game.tileView.trackObject(game.sprite);
            onResize();
            console.log("READY TO GO!");
         });
      }
   };
});


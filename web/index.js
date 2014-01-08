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
         "/images/items.png"
      ],
      maps: _.keys(pow2.getMaps()),
      state:'Uninitialized',
      listeners:[],
      currentMap: 15,
      loader: new pow2.ResourceLoader(),
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
         self.world = new pow2.World({
            scene:new pow2.Scene({
               autoStart: true,
               debugRender:false
            }),
            state:new pow2.GameStateMachine()
         });
         this.loader.load(this.files,function(){
            self.state = 'Loaded';
            self.scene = self.world.scene;
            self.input = self.scene.input = self.world.input;
            self.scene.once('map:loaded',function(){
               // Create a movable character with basic components.
               self.sprite = new pow2.TileObject({
                  point: self.tileMap.bounds.getCenter(),
                  icon:"warrior.png"
               });
               self.sprite.addComponent(new pow2.CollisionComponent());
               self.sprite.addComponent(new pow2.PlayerComponent());
               self.sprite.addComponent(new pow2.PlayerCameraComponent());
               self.sprite.addComponent(new pow2.PlayerTouchComponent());
               self.scene.addObject(self.sprite);
            });
            self.tileMap = new pow2.GameTileMap("town");
            self.scene.addObject(self.tileMap);

            return done();
         });
         return deferred.promise;
      },
      getCurrentMapName: function(){
         if(!this.tileMap || !this.tileMap.map){
            return null;
         }
         return this.tileMap.map.name;
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
   game.load().then(function(){
      $scope.mapName = game.getCurrentMapName();

      // TODO: A better system for game event handling.

      // Dialog bubbles
      game.scene.on('dialog:entered',function(feature){
         $scope.$apply(function(){
            $scope.dialog = feature;
         });
      });
      game.scene.on('dialog:exited',function(){
         $scope.$apply(function(){
            $scope.dialog = null;
         });
      });

      // Stores
      game.scene.on('store:entered',function(feature){
         $scope.$apply(function(){
            $scope.store = feature;
         });
      });
      game.scene.on('store:exited',function(){
         $scope.$apply(function(){
            $scope.store = null;
         });
      });
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
            game.world.input.touchCurrent = new pow2.Point(0, 0);
            game.world.input.touchStart = new pow2.Point(0, 0);
            game.world.input.analogVector = new pow2.Point(0, 0);


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

            game.tileView = new pow2.GameMapView(element[0], game.loader);
            game.world.state.setGameView(game.tileView);
            game.tileView.camera.extent.set(10, 10);
            game.tileView.setTileMap(game.tileMap);
            game.scene.addView(game.tileView);
            if(game.sprite){
               game.tileView.trackObject(game.sprite);
            }

            onResize();
            console.log("READY TO GO!");
         });
      }
   };
});

// IconRender directive
// ----------------------------------------------------------------------------
twoFiftySix.app.directive('iconRender', function ($compile, game) {
   return {
      restrict: 'A',
      link: function ($scope, element, attrs) {
         // A rendering canvas
         $scope.renderCanvas = $compile('<canvas style="position:absolute;left:-9000px;top:-9000px;" width="64" height="64"></canvas>')($scope);
         element.append($scope.renderCanvas);

         // Get the context for drawing
         $scope.renderContext = $scope.renderCanvas[0].getContext("2d");
         $scope.renderContext.webkitImageSmoothingEnabled = false;
         $scope.renderContext.mozImageSmoothingEnabled = false;

         $scope.$watch(attrs.feature, function(feature) {
            if(!feature || !feature.icon){
               return;
            }
            game.load().then(function () {
               game.world.sprites.getSingleSprite(feature.icon,function(sprite){
                  $scope.renderContext.clearRect(0, 0, 64, 64);
                  $scope.renderContext.drawImage(sprite, 0, 0, 64, 64);
                  $scope.$apply(function(){
                     feature.image = $scope.renderCanvas[0].toDataURL();
                  });

               });
            });
         });
      }
   };
});
// DialogBubble directive
// ----------------------------------------------------------------------------
twoFiftySix.app.directive('dialogBubble', function () {
   return {
      restrict: 'E',
      replace:true,
      templateUrl: '/templates/dialogBubble.html'
   };
});
// StoreBubble directive
// ----------------------------------------------------------------------------
twoFiftySix.app.directive('storeBubble', function () {
   return {
      restrict: 'E',
      templateUrl: '/templates/storeBubble.html'
   };
});

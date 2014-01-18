/// <reference path="../../source/game/gameStateMachine.ts"/>
/// <reference path="../../source/game/gameWorld.ts"/>
/// <reference path="../../source/game/models/heroModel.ts"/>
/// <reference path="../../types/underscore/underscore.d.ts"/>
/// <reference path="../../types/backbone/backbone.d.ts"/>
/// <reference path="../../types/angularjs/angular.d.ts"/>

module pow2 {
   export var app = angular.module('pow2', []);
   app.directive('eightBitPanel', function() {
      return {
         restrict: 'A',
         transclude:true,
         template: '<div class="tl"></div><div class="tr"></div><div class="bl"></div><div class="br"></div><div class="content"  ng-transclude></div>',
         link: function (scope, element, attrs) {
            element.addClass('ebp');
         }
      };
   });

   app.factory('game', function(){
      this.loader = new ResourceLoader();
      this.world = new GameWorld({
         scene:new Scene({
            autoStart: true,
            debugRender:false
         }),
         state:new GameStateMachine()
      });
      this.state = 'Loaded';
      this.scene = this.world.scene;
      this.input = this.scene.input = this.world.input;
      this.scene.once('map:loaded',() => {
         var heroModel:HeroModel = HeroModel.create(HeroType.Warrior);
         this.world.state.model.addHero(heroModel);

         // Create a movable character with basic components.
         this.sprite = GameStateMachine.createHeroEntity("Hero!", heroModel);
         this.sprite.setPoint(this.tileMap.bounds.getCenter());
         this.sprite.addComponent(new CollisionComponent());
         this.sprite.addComponent(new PlayerComponent());
         this.sprite.addComponent(new PlayerCameraComponent());
         this.sprite.addComponent(new PlayerTouchComponent());
         this.sprite.addComponent(new CombatEncounterComponent());
         this.scene.addObject(this.sprite);
      });
      this.tileMap = new GameTileMap("town");
      this.scene.addObject(this.tileMap);

      return this;
   });

   app.controller('pow2App',function($scope,$rootScope,$http,$timeout,game){
      var stateKey = "_testPow2State";
      $scope.overlayText = null;
      $scope.saveState = function(data){
         localStorage.setItem(stateKey,data);
      };
      $scope.clearState = function() {
         localStorage.removeItem(stateKey);
      };
      $scope.getState = function(){
         return localStorage.getItem(stateKey);
      };

      $scope.displayMessage = function(message,callback?) {
         $scope.overlayText = message;
         $timeout(function(){
            $scope.overlayText = null;
            callback && callback();
         },1000);
      };

      // TODO: A better system for game event handling.
      game.world.state.on('enter',function(state){
         console.log("UI: Entered state: " + state.name);
         $scope.$apply(function(){
            if(state.name === GameCombatState.NAME){
               $scope.inCombat = true;
               $scope.displayMessage(state.name);
               $scope.combat = state.machine;
               state.machine.on('combat:attack',function(attacker,defender){
                  state.machine.paused = true;
                  var change = defender.model.previous('hp') - defender.model.attributes.hp;
                  $scope.$apply(function(){
                     var msg = attacker.model.get('name') + " attacked " + defender.model.get('name') + " for " + change + " damage!";
                     $scope.displayMessage(msg,function(){
                        state.machine.paused = false;
                     });
                  });
               });
               state.machine.on('combat:victory',function(winner,loser) {
                  state.machine.paused = true;
                  $scope.$apply(function(){
                     var msg = winner.model.get('name') + " DEFEATED " + loser.model.get('name') + "!";
                     $scope.displayMessage(msg,function(){
                        state.machine.paused = false;
                     });
                  });
               });
            }
         });
      });
      game.world.state.on('exit',function(state){
         $scope.$apply(function(){
            if(state.name === GameMapState.NAME){
               $scope.dialog = null;
               $scope.store = null;
            }
            else if(state.name === GameCombatState.NAME){
               $scope.inCombat = false;
               $scope.combat = null;
            }
         });
         console.log("UI: Exited state: " + state.name);
      });

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


   app.directive('gameView', function ($compile, game) {
      return {
         restrict: 'A',
         link: function ($scope, element, attrs) {
            $scope.canvas = element[0];
            var context = $scope.canvas.getContext("2d");
            context.webkitImageSmoothingEnabled = false;
            context.mozImageSmoothingEnabled = false;

            // Inspired by : http://seb.ly/2011/04/multi-touch-game-controller-in-javascripthtml5-for-ipad/
            $scope.canvas.addEventListener('touchstart', onTouchStart, false);
            $scope.canvas.addEventListener('touchmove', onTouchMove, false);
            $scope.canvas.addEventListener('touchend', onTouchEnd, false);
            window.addEventListener('resize',onResize,false);

            /**
             * Game analog input
             * TODO: Move this into a touch input component.
             */
            game.world.input.touchId = -1;
            game.world.input.touchCurrent = new Point(0, 0);
            game.world.input.touchStart = new Point(0, 0);
            game.world.input.analogVector = new Point(0, 0);


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

            game.tileView = new GameMapView(element[0], game.loader);
            game.world.state.setGameView(game.tileView);
            game.tileView.camera.extent.set(10, 10);
            game.tileView.setTileMap(game.tileMap);
            game.scene.addView(game.tileView);
            if(game.sprite){
               game.tileView.trackObject(game.sprite);
            }

            onResize();
            console.log("READY TO GO!");
         }
      };
   });

// IconRender directive
// ----------------------------------------------------------------------------
   app.directive('iconRender', function ($compile, game) {
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

               if(!feature){
                  return;
               }
               var icon = feature.icon;
               if(!icon && feature.getIcon){
                  icon = feature.getIcon();
               }
               if(!icon){
                  return;
               }
               game.world.sprites.getSingleSprite(icon,function(sprite){
                  $scope.renderContext.clearRect(0, 0, 64, 64);
                  $scope.renderContext.drawImage(sprite, 0, 0, 64, 64);
                  $scope.$apply(function(){
                     feature.rendered = $scope.renderCanvas[0].toDataURL();
                  });

               });
            });
         }
      };
   });

// CombatView directive
// ----------------------------------------------------------------------------
   app.directive('combatView', function () {
      return {
         restrict: 'E',
         templateUrl: '/templates/combatView.html'
      };
   });


// DialogBubble directive
// ----------------------------------------------------------------------------
   app.directive('dialogBubble', function () {
      return {
         restrict: 'E',
         replace:true,
         templateUrl: '/templates/dialogBubble.html'
      };
   });
// StoreBubble directive
// ----------------------------------------------------------------------------
   app.directive('storeBubble', function () {
      return {
         restrict: 'E',
         templateUrl: '/templates/storeBubble.html'
      };
   });

}


//


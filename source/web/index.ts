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

   export class AngularGameFactory {
      loader:ResourceLoader;
      world:GameWorld;
      tileMap:GameTileMap;
      sprite:GameEntityObject;
      constructor(){
         this.loader = new ResourceLoader();
         this.world = new GameWorld({
            scene:new Scene({
               autoStart: true,
               debugRender:false
            }),
            state:new GameStateMachine()
         });
         this.world.scene.once('map:loaded',() => {
            var heroModel:HeroModel = HeroModel.create(HeroType.Warrior);
            this.world.state.model.addHero(heroModel);

            // Create a movable character with basic components.
            this.sprite = GameStateMachine.createHeroEntity("Hero!", heroModel);
            this.sprite.setPoint(this.tileMap.bounds.getCenter());
            this.sprite.addComponent(new CollisionComponent());
            this.sprite.addComponent(new PlayerComponent());
            this.sprite.addComponent(new PlayerCameraComponent());
            this.sprite.addComponent(new PlayerTouchComponent());
            this.world.scene.addObject(this.sprite);
         });
         this.tileMap = new GameTileMap("town");
         this.world.scene.addObject(this.tileMap);
      }
   }
   app.factory('game', () => {
      return new AngularGameFactory();
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
      game.world.scene.on('dialog:entered',function(feature){
         $scope.$apply(function(){
            $scope.dialog = feature;
         });
      });
      game.world.scene.on('dialog:exited',function(){
         $scope.$apply(function(){
            $scope.dialog = null;
         });
      });

      // Stores
      game.world.scene.on('store:entered',function(feature){
         $scope.$apply(function(){
            $scope.store = feature;
         });
      });
      game.world.scene.on('store:exited',function(){
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

            window.addEventListener('resize',onResize,false);
            var $window = $(window);
            function onResize(){
               context.canvas.width = $window.width();
               context.canvas.height = $window.height();
               context.webkitImageSmoothingEnabled = false;
               context.mozImageSmoothingEnabled = false;
            }

            game.tileView = new GameMapView(element[0], game.loader);
            game.world.state.setGameView(game.tileView);
            game.tileView.camera.extent.set(10, 10);
            game.tileView.setTileMap(game.tileMap);
            game.world.scene.addView(game.tileView);
            if(game.sprite){
               game.tileView.trackObject(game.sprite);
            }

            onResize();
            console.log("READY TO GO!");
         }
      };
   });
   app.directive('combatView', function ($compile, game) {
      return {
         restrict: 'A',
         link: function ($scope, element, attrs) {
            $scope.canvas = element[0];
            var context = $scope.canvas.getContext("2d");
            context.webkitImageSmoothingEnabled = false;
            context.mozImageSmoothingEnabled = false;
            window.addEventListener('resize',onResize,false);
            var $window = $(window);
            function onResize(){
               context.canvas.width = $window.width();
               context.canvas.height = $window.height();
               context.webkitImageSmoothingEnabled = false;
               context.mozImageSmoothingEnabled = false;
            }
            game.tileView = new GameMapView(element[0], game.loader);
            game.world.state.setGameView(game.tileView);
            game.tileView.camera.extent.set(10, 10);
            game.tileView.setTileMap(game.tileMap);
            game.world.scene.addView(game.tileView);
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


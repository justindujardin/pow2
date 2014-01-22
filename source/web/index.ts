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

   var stateKey = "_testPow2State";
   export function resetGame() {
      localStorage.removeItem(stateKey);
   }

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
            // Create a movable character with basic components.
            this.sprite = GameStateMachine.createHeroEntity("Hero!", this.world.state.model.party[0]);
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

      loadGame(data:any){
         if(this.world.state.model){
            this.world.state.model.destroy();
         }
         this.world.state.model = new GameStateModel(data, {parse: true});
         // Only add a hero if none exists.
         // TODO: This init stuff should go in a 'newGame' method or something.
         if(this.world.state.model.party.length === 0){
            var heroModel:HeroModel = HeroModel.create(HeroType.Warrior);
            this.world.state.model.addHero(heroModel);
            var heroModel:HeroModel = HeroModel.create(HeroType.Wizard);
            this.world.state.model.addHero(heroModel);
         }

      }
   }
   app.factory('game', () => {
      return new AngularGameFactory();
   });

   app.controller('pow2App',function($scope,$rootScope,$http,$timeout,game){
      $scope.overlayText = null;
      $scope.saveState = function(data){
         localStorage.setItem(stateKey,data);
      };
      $scope.range = function(n) {
         return new Array(n);
      };
      $scope.clearState = function() {
         localStorage.removeItem(stateKey);
      };
      $scope.getState = function(){
         return localStorage.getItem(stateKey);
      };
      // TODO: Resets state every page load.  Remove when persistence is desired.
      //resetGame();

      // TODO: Move level table elsewhere

      $scope.displayMessage = function(message,callback?,time:number=1000) {
         $scope.overlayText = message;
         $timeout(function(){
            $scope.overlayText = null;
            callback && callback();
         },time);
      };
      game.loadGame($scope.getState());
      $scope.gameModel = game.world.state.model;
      $scope.party = game.world.state.model.party;
      $scope.player = game.world.state.model.party[0];

      var warriorTable = [];
      var p:HeroModel = $scope.party[0];
      var wizardTable = [];
      var q:HeroModel = $scope.party[1];
      for(var i = 1; i <= HeroModel.MAX_LEVEL; i++){
         warriorTable.push({
            level:i,
            hp:p.getHPForLevel(i),
            experience:p.getXPForLevel(i),
            strength: p.getStrengthForLevel(i),
            agility: p.getAgilityForLevel(i),
            intelligence: p.getIntelligenceForLevel(i),
            vitality: p.getVitalityForLevel(i)
         });
         wizardTable.push({
            level:i,
            hp:q.getHPForLevel(i),
            experience:q.getXPForLevel(i),
            strength: q.getStrengthForLevel(i),
            agility: q.getAgilityForLevel(i),
            intelligence: q.getIntelligenceForLevel(i),
            vitality: q.getVitalityForLevel(i)
         });
      }
      $scope.warriorLevelTable = warriorTable;
      $scope.wizardLevelTable = wizardTable;


      // TODO: A better system for game event handling.
      game.world.state.on('enter',function(state){
         console.log("UI: Entered state: " + state.name);
         $scope.$apply(function(){
            if(state.name === GameCombatState.NAME){
               $scope.combat = state.machine;
               $scope.inCombat = true;
               $scope.displayMessage(state.name);
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
                        var data = game.world.state.model.toJSON();
                        //console.log(data);
                        $scope.saveState(JSON.stringify(data));
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

      // TODO: Some kind of events mapping, that handles this (assigning to scope)
      // in a generic way.  Lots of duplication here.  Beware!

      // Temple Dialog
      game.world.scene.on('temple:entered',function(feature){
         $scope.$apply(function(){
            $scope.temple = feature;
         });
      });
      game.world.scene.on('temple:exited',function(){
         $scope.$apply(function(){
            $scope.temple = null;
         });
      });
      $scope.heal = () => {
         if(!$scope.temple){
            return;
         }
         var model:GameStateModel = game.world.state.model;
         var money:number = model.get('gold');
         var cost:number = parseInt($scope.temple.cost);
         if(cost > money){
            $scope.displayMessage("You don't have enough money");
         }
         else {
            //console.log("You have (" + money + ") monies.  Spending (" + cost + ") on temple");
            model.set({
               gold: money - cost
            });
            _.each(model.party,(hero:HeroModel) => {
               hero.set({
                  hp: hero.get('maxHP')
               });
            });
            $scope.displayMessage("Your party has been healed! \nYou now have (" + model.get('gold') + ") monies.",null,2500);

         }
         $scope.temple = null;

      };
      $scope.cancel = () => {
         $scope.temple = null;
      };


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
      $scope.buyItem = (item) => {
         if(!$scope.store || !item){
            return;
         }
         var model:GameStateModel = game.world.state.model;
         var money:number = model.get('gold');
         var cost:number = parseInt(item.cost);
         if(cost > money){
            $scope.displayMessage("You don't have enough money");
         }
         else {
            //console.log("You have (" + money + ") monies.  Spending (" + cost + ") on temple");
            model.set({
               gold: money - cost
            });
            model.inventory.push(item);

            //HACKS: Force equip to player0
            //TODO: equipment UI
            var player:HeroModel = model.party[0];
            if(item.itemType === 'armor'){
               player.armor.push(new ArmorModel(item));
            }
            else if(item.itemType === 'weapon'){
               player.weapon = new WeaponModel(item);
            }

            $scope.displayMessage("Purchased " + item.name + ".",null,2500);

         }
      };
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
            var renderCanvas = $compile('<canvas style="position:absolute;left:-9000px;top:-9000px;" width="64" height="64"></canvas>')($scope);
            var renderImage = $compile('<img src="" width="64"/>')($scope);
            element.append(renderCanvas);
            element.append(renderImage);

            // Get the context for drawing
            $scope.renderContext = renderCanvas[0].getContext("2d");
            $scope.renderContext.webkitImageSmoothingEnabled = false;
            $scope.renderContext.mozImageSmoothingEnabled = false;

            $scope.$watch(attrs.icon, function(icon) {

               if(!icon){
                  return;
               }
               game.world.sprites.getSingleSprite(icon,function(sprite){
                  $scope.renderContext.clearRect(0, 0, 64, 64);
                  $scope.renderContext.drawImage(sprite, 0, 0, 64, 64);
                  $scope.$apply(function(){
                     renderImage[0].src = renderCanvas[0].toDataURL();
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
// TempleView directive
// ----------------------------------------------------------------------------
   app.directive('templeView', function () {
      return {
         restrict: 'E',
         templateUrl: '/templates/templeView.html'
      };
   });
// PartyView directive
// ----------------------------------------------------------------------------
   app.directive('partyView', function () {
      return {
         restrict: 'E',
         templateUrl: '/templates/partyView.html'
      };
   });
// HeroView directive
// ----------------------------------------------------------------------------
   app.directive('heroView', function ($compile) {
      return {
         restrict: 'E',
         scope:true,
         templateUrl: '/templates/heroView.html',
         link: function ($scope, element, attrs) {
            $scope.hero = attrs.hero;
            $scope.$watch(attrs.hero, function(hero) {
               $scope.hero = hero;
            });
         }
      };
   });

// HeroView directive
// ----------------------------------------------------------------------------
   app.directive('heroStatsView', function ($compile) {
      return {
         restrict: 'E',
         scope:true,
         templateUrl: '/templates/heroStatsView.html',
         link: function ($scope, element, attrs) {
            $scope.hero = attrs.hero;
            $scope.$watch(attrs.hero, function(hero) {
               $scope.hero = hero;
            });
         }
      };
   });

}


//


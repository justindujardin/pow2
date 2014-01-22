/// <reference path="../services/gameFactory.ts"/>

module pow2.ui {
   var stateKey = "_testPow2State";
   export function resetGame() {
      localStorage.removeItem(stateKey);
   }
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
}


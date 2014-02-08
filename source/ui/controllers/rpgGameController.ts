/**
 Copyright (C) 2013 by Justin DuJardin

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
/// <reference path="../services/gameService.ts"/>

module pow2.ui {
   var stateKey = "_testPow2State";
   export function resetGame() {
      localStorage.removeItem(stateKey);
   }
   app.controller('RPGGameController',[
      '$scope',
      '$timeout',
      'game',
      function($scope,$timeout,game:PowGameService){
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
         $scope.saveGame = function(){
            var data = JSON.stringify(game.model.toJSON());
            $scope.saveState(data);
         };
         // TODO: Resets state every page load.  Remove when persistence is desired.
         //resetGame();

         $scope.displayMessage = function(message,callback?,time:number=1000) {
            $scope.overlayText = message;
            $timeout(function(){
               $scope.overlayText = null;
               callback && callback();
            },time);
         };
         game.loadGame($scope.getState());
         $scope.gameModel = game.model;
         $scope.party = game.model.party;
         $scope.inventory = game.model.inventory;
         $scope.player = game.model.party[0];

         // TODO: A better system for game event handling.
         game.machine.on('enter',function(state){
            if(state.name === GameCombatState.NAME){
               $scope.$apply(function(){
                  $scope.combat = state.machine;
                  $scope.inCombat = true;
                  $scope.displayMessage(state.name);
                  state.machine.on('combat:attack',function(damage,attacker,defender){
                     state.machine.paused = true;
                     $scope.$apply(function(){
                        var msg = attacker.model.get('name') + " attacked " + defender.model.get('name') + " for " + damage + " damage!";
                        $scope.displayMessage(msg,function(){
                           state.machine.paused = false;
                        });
                     });
                  });
                  state.machine.on('combat:victory',function(winner,loser,leveled) {
                     state.machine.paused = true;
                     $scope.$apply(function(){
                        var msg = "Enemies Defeated!";
                        $scope.displayMessage(msg,function(){
                           state.machine.paused = false;
                           var data = game.model.toJSON();
                           //console.log(data);
                           $scope.saveState(JSON.stringify(data));
                        });
                     });
                  });
               });
            }
         });
         game.machine.on('exit',function(state){
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
      }
   ]);
}


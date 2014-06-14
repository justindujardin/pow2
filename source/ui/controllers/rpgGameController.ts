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
/// <reference path="../services/alertService.ts"/>

module pow2.ui {
   var stateKey = "_testPow2State";
   export function resetGame() {
      localStorage.removeItem(stateKey);
   }
   app.controller('RPGGameController',[
      '$scope',
      '$timeout',
      'game',
      'powAlert',
      function($scope,$timeout,game:PowGameService,powAlert:PowAlertService){
         $scope.loadingTitle = "Pow2!";
         $scope.loadingMessage = "Asking Google for data...";
         $scope.loading = true;
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
            var party = <pow2.PlayerComponent>game.currentScene.componentByType(pow2.PlayerComponent);
            if (party) {
               game.model.set('playerPosition',party.host.point);
            }
            var data = JSON.stringify(game.model.toJSON());
            $scope.saveState(data);
            powAlert.show("Game Saved!");
         };

         GameStateModel.getDataSource(()=>{
            $scope.loadingMessage = "Loading the things...";
            // TODO: Resets state every page load.  Remove when persistence is desired.
            //resetGame();
            game.loadGame($scope.getState(),()=>{
               $scope.gameModel = game.model;
               $scope.party = game.model.party;
               $scope.inventory = game.model.inventory;
               $scope.player = game.model.party[0];
            });
         });

         game.currentScene.on("map:loaded",(map:GameTileMap) => {
            game.model.set('playerMap',map.mapName);
         });
         // TODO: A better system for game event handling.
         game.machine.on('enter',function(state){
            if(state.name === GameMapState.NAME){
               $scope.$apply(function(){
                  $scope.loading = false;
                  $scope.loaded = true;
               });
            }
            if(state.name === GameCombatState.NAME){
               $scope.$apply(function(){
                  $scope.combat = state.machine;
                  $scope.inCombat = true;
                  state.machine.on('combat:attack',function(damage,attacker,defender){
                     state.machine.paused = true;
                     var msg:string = '';
                     var a = attacker.model.get('name');
                     var b = defender.model.get('name');
                     if(damage > 0){
                        msg = a + " attacked " + b + " for " + damage + " damage!";
                     }
                     else {
                        msg = a + " attacked " + b + ", and MISSED!";
                     }
                     powAlert.show(msg,function(){
                        state.machine.paused = false;
                     });
                  });
                  state.machine.on('combat:victory',function(data:CombatVictorySummary) {
                     state.machine.paused = true;
                     powAlert.show("Found " + data.gold + " gold!",null,0);
                     powAlert.show("Gained " + data.exp + " experience!",null,0);
                     angular.forEach(data.levels,(hero:HeroModel) => {
                        powAlert.show(hero.get('name') + " reached level " + hero.get('level') + "!",null,0);
                     });
                     powAlert.show("Enemies Defeated!",function(){
                        state.machine.paused = false;
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
      }
   ]);
}


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
/// <reference path="../services/gameFactory.ts"/>
module pow2.ui {
// StoreBubble directive
// ----------------------------------------------------------------------------
   app.directive('storeBubble',['game',function (game,$aside) {
      return {
         restrict: 'E',
         templateUrl: '/templates/storeBubble.html',
         controller : function($scope,$element){
            $scope.buyItem = (item) => {
               if(!$scope.store || !item){
                  return;
               }
               var model:GameStateModel = game.model;
               var money:number = model.get('gold');
               var cost:number = parseInt(item.cost);
               if(cost > money){
                  $scope.displayMessage("You don't have enough money");
               }
               else {
                  model.set({
                     gold: money - cost
                  });

                  //HACKS: Force equip to player0
                  //TODO: equipment UI
                  var player:HeroModel = model.party[0];
                  var inventoryModel:any = null;
                  if(item.itemType === 'armor'){
                     inventoryModel = new ArmorModel(item);
                     player.armor.push(inventoryModel);
                  }
                  else if(item.itemType === 'weapon'){
                     inventoryModel = new WeaponModel(item);
                     player.weapon = inventoryModel;
                  }
                  $scope.displayMessage("Purchased " + item.name + ".",null,2500);
                  model.inventory.push(inventoryModel);

               }
            };
         },
         link: function($scope,$element,$attrs){

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

         }

      };
   }]);
}
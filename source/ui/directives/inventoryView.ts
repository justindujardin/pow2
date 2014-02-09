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
/// <reference path="../../game/models/itemModel.ts"/>
/// <reference path="../../game/models/heroModel.ts"/>
module pow2.ui {
   app.directive('inventoryView',['game','powAlert', function (game:PowGameService,powAlert:PowAlertService) {
      return {
         restrict: 'E',
         templateUrl: '/templates/inventoryView.html',
         controller : function($scope,$element){
            var currentIndex:number = 0;
            $scope.character = $scope.party[currentIndex];
            $scope.nextCharacter = () => {
               currentIndex++;
               if(currentIndex >= $scope.party.length){
                  currentIndex = 0;
               }
               $scope.character = $scope.party[currentIndex];
            };
            $scope.previousCharacter = () => {
               currentIndex--;
               if(currentIndex < 0){
                  currentIndex = $scope.party.length - 1;
               }
               $scope.character = $scope.party[currentIndex];
            };
            $scope.equipItem = (item:ItemModel) => {
               var hero:HeroModel = $scope.character;
               if(!$scope.inventory || !item || !hero){
                  return;
               }
               if(item instanceof ArmorModel){
                  hero.armor.push(item);
               }
               else if(item instanceof WeaponModel){
                  hero.weapon = item;
               }
               game.model.inventory = _.filter(game.model.inventory,(i:ItemModel) => {
                  return i.cid === item.cid;
               });
               item.equippedBy = hero;
               powAlert.show("Equipped " + item.attributes.name + " to " + hero.attributes.name);
            };

            $scope.unequipItem = (item:ItemModel) => {
               var hero:HeroModel = $scope.character;
               if(!$scope.inventory || !item || !hero){
                  return;
               }
               if(item instanceof ArmorModel){
                  hero.armor = _.filter(hero.armor,(i) => {
                     return i.cid !== item.cid;
                  });
               }
               else if(item instanceof WeaponModel){
                  hero.weapon = null;
               }
               item.equippedBy = null;
               game.model.inventory.push(item);
               powAlert.show("Unequipped " + item.attributes.name + " from " + hero.attributes.name);
            };
         }
      };
   }]);
}
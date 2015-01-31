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
   app.directive('inventoryView',['game','powAlert', function (game:PowGameService,powAlert:PowAlertService) {
      return {
         restrict: 'E',
         templateUrl: '/source/rpg/directives/inventoryView.html',
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

               var users = item.get('usedby');
               if(users && _.indexOf(users,hero.get('type')) === -1) {
                  powAlert.show(hero.get('name') + " cannot equip this item");
                  return;
               }

               if(item instanceof ArmorModel){
                  var old:ArmorModel = hero.equipArmor(item);
                  if(old){
                     game.world.model.addInventory(old);
                  }
               }
               else if(item instanceof WeaponModel){
                  // Remove any existing weapon first
                  if(hero.weapon){
                     game.world.model.addInventory(hero.weapon);
                  }
                  hero.weapon = <WeaponModel>item;
               }
               game.world.model.removeInventory(item);
               //powAlert.show("Equipped " + item.attributes.name + " to " + hero.attributes.name);
            };

            $scope.unequipItem = (item:ItemModel) => {
               var hero:HeroModel = $scope.character;
               if(!$scope.inventory || !item || !hero){
                  return;
               }
               if(item instanceof ArmorModel){
                  hero.unequipArmor(item);
               }
               else if(item instanceof WeaponModel){
                  var weapon:WeaponModel = <WeaponModel>item;
                  if(weapon.isNoWeapon()){
                     return;
                  }
                  hero.weapon = null;
               }
               game.world.model.addInventory(item);
               //powAlert.show("Unequipped " + item.attributes.name + " from " + hero.attributes.name);
            };
         }
      };
   }]);
}
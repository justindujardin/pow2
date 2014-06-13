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
// StoreBubble directive
// ----------------------------------------------------------------------------
   app.directive('storeView',['game','powAlert',function (game:PowGameService,powAlert:PowAlertService) {
      return {
         restrict: 'E',
         templateUrl: '/source/ui/directives/storeView.html',
         controller : function($scope,$element){
            $scope.buyItem = (item) => {
               if(!$scope.store || !item){
                  return;
               }
               var model:GameStateModel = game.model;
               var money:number = model.get('gold');
               var cost:number = parseInt(item.cost);
               if(cost > money){
                  powAlert.show("You don't have enough money");
               }
               else {
                  model.set({
                     gold: money - cost
                  });
                  var inventoryModel:any = null;
                  if(item.itemType === 'armor'){
                     inventoryModel = new ArmorModel(item);
                  }
                  else if(item.itemType === 'weapon'){
                     inventoryModel = new WeaponModel(item);
                  }
                  powAlert.show("Purchased " + item.name + ".",null,1500);
                  model.inventory.push(inventoryModel);

               }
            };
            $scope.initStoreFromFeature = (feature:pow2.StoreFeatureComponent) => {
               // Get enemies data from spreadsheet
               game.model.getDataSource((data:pow2.GoogleSpreadsheetResource) => {
                  var type:string = 'unknown';
                  var sheet:string = '';
                  if(_.indexOf(feature.host.groups,"weapon") !== -1){
                     type = 'weapon';
                     sheet = 'Weapons';
                  }
                  else if(_.indexOf(feature.host.groups,"armor") !== -1){
                     type = 'armor';
                     sheet = 'Armor';
                  }
                  var raw = _.where(data.getSheetData(sheet),{level:feature.feature.level});
                  feature.inventory = _.map(raw,(item:any)=>{
                     item.itemType = type;
                     return item;
                  });

                  $scope.$apply(() => {
                     $scope.store = feature;
                  });
               });
            };
         },
         link: ($scope) => {

            // Stores
            game.world.scene.on('store:entered',(feature:StoreFeatureComponent) =>{
               $scope.initStoreFromFeature(feature);
            });
            game.world.scene.on('store:exited',() => {
               $scope.$apply(() => {
                  $scope.store = null;
               });
            });

         }

      };
   }]);
}
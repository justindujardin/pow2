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
               var model:GameStateModel = game.world.model;
               var cost:number = parseInt(item.cost);
               if(cost > model.gold){
                  powAlert.show("You don't have enough money");
               }
               else {
                  model.gold -= cost;
                  powAlert.show("Purchased " + item.name + ".",null,1500);
                  model.inventory.push(item.instanceModel.clone());

               }
            };
            $scope.initStoreFromFeature = (feature:pow2.StoreFeatureComponent) => {
               // Get enemies data from spreadsheet
               GameStateModel.getDataSource((data:pow2.GoogleSpreadsheetResource) => {

                  var hasCategory:boolean = typeof feature.host.category !== 'undefined';
                  var theChoices: any[] = [];
                  if(!hasCategory || feature.host.category === 'weapons'){
                     theChoices = theChoices.concat(_.map(data.getSheetData('weapons'),(w)=>{
                        return _.extend({ instanceModel: new WeaponModel(w) },w);
                     }));
                  }
                  if(!hasCategory || feature.host.category === 'armor') {
                     theChoices = theChoices.concat(_.map(data.getSheetData('armor'), (a)=> {
                        return _.extend({ instanceModel: new ArmorModel(a) }, a);
                     }));
                  }
                  var items = [];
                  _.each(feature.host.groups,(group:string)=>{
                     items = items.concat(_.filter(theChoices,(c:any)=>{
                        return _.indexOf(c.groups,group) !== -1;
                     }));
                  });

                  feature.inventory =  _.where(items,{level:feature.feature.level});
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
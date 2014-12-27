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

   export class StoreViewController implements IProcessObject {
      static $inject:string[] = ['game','powAlert','$scope'];
      constructor(
         public game:PowGameService,
         public powAlert:PowAlertService,
         public $scope:any) {
         game.world.time.addObject(this);
         $scope.$on('$destroy',()=>{
            this.destroy();
         });
         this.gameModel = game.world.model;

      }

      /**
       * The game state model to modify.
       * @type {pow2.GameStateModel}
       */
      gameModel:pow2.GameStateModel = null;

      /**
       * The selected item to purchase/sell.
       * @type {pow2.ItemModel}
       */
      selected:pow2.ItemModel = null;

      /**
       * Determine if the UI is in a selling state.
       * @type {boolean}
       */
      selling:boolean = false;

      destroy(){
         this.$scope.store = null;
         this.selling = false;
         this.selected = null;
      }
      actionItem(item) {
         if(!this.$scope.store || !item){
            return;
         }

         var model:GameStateModel = this.game.world.model;
         var value:number = parseInt(item.cost);
         if(this.selling){
            var itemIndex:number = -1;
            for (var i = 0; i < model.inventory.length; i++) {
               if (model.inventory[i].id === item.id) {
                  itemIndex = i;
                  break;
               }
            }
            if(itemIndex !== -1){
               model.gold += value;
               this.powAlert.show("Sold " + item.name + " for " + item.cost + " gold.",null,1500);
               model.inventory.splice(itemIndex,1);
            }
         }
         else {
            if(value > model.gold){
               this.powAlert.show("You don't have enough money");
               return;
            }
            else {
               model.gold -= value;
               this.powAlert.show("Purchased " + item.name + ".",null,1500);
               model.inventory.push(item.instanceModel.clone());
            }
         }

         this.selected = null;
         this.selling = false;

      }

      getActionVerb():string {
         return this.selling ? "Sell" : "Buy";
      }

      isBuying():boolean {
         return !this.selected && !this.selling;
      }
      isSelling():boolean {
         return !this.selected && this.selling;
      }

      toggleAction() {
         if(!this.selling){
            if(this.gameModel.inventory.length === 0) {
               this.powAlert.show("You don't have any unequipped inventory to sell.",null,1500);
               this.selling = false;
               return;
            }
         }
         this.selling = !this.selling;
      }

      selectItem(item:any){
         if(item instanceof pow2.ItemModel){
            item = item.toJSON();
         }
         this.selected = item;
      }
      initStoreFromFeature(feature:pow2.StoreFeatureComponent) {
         // Get enemies data from spreadsheet
         GameStateModel.getDataSource((data:pow2.GameDataResource) => {

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

            feature.inventory =  _.where(items,{level:feature.host.feature.level});
            this.$scope.$apply(() => {
               this.$scope.store = feature;
            });
         });
      }
   }


   app.directive('storeView',['game',(game:PowGameService,powAlert:PowAlertService) => {
      return {
         restrict: 'E',
         templateUrl: '/source/ui/directives/storeView.html',
         controller : StoreViewController,
         controllerAs:'storeCtrl',
         link: ($scope,element,attrs,controller:StoreViewController) => {
            // Stores
            game.world.scene.on('store:entered',(feature:StoreFeatureComponent) =>{
               controller.initStoreFromFeature(feature);
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
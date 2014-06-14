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

/// <reference path="../../../types/backbone/backbone.d.ts" />
/// <reference path="../../../types/underscore/underscore.d.ts" />
/// <reference path="../../../lib/pow2.d.ts" />
/// <reference path="./entityModel.ts" />
/// <reference path="./heroModel.ts" />
/// <reference path="./itemModel.ts" />
module pow2 {

   export interface GameStateModelOptions {
      gold:number;
   }

   export class GameStateModel extends Backbone.Model {
      party:HeroModel[]; // The player's party
      inventory:ItemModel[]; // The inventory of items owned by the player.
      loader:pow2.ResourceLoader;
      static DEFAULTS:GameStateModelOptions = {
         gold: 200
      };
      defaults():any {
         return _.extend({}, GameStateModel.DEFAULTS);
      }
      initialize(options?:any) {
         super.initialize(options);
         if(typeof this.party === 'undefined'){
            this.party = [];
         }
         if(typeof this.inventory === 'undefined'){
            this.inventory = [];
         }
      }

      initData(loader:pow2.ResourceLoader,then?:(data:GoogleSpreadsheetResource)=>any){
         this.loader = loader;
         this.getDataSource(then);
      }

      private _gameData:pow2.GoogleSpreadsheetResource;
      public googSpreadsheetId:string = "1IAQbt_-Zq1BUwRNiJorvt4iPEYb5HmZrpyMOkb-OuJo";
      getDataSource(then?:(data:GoogleSpreadsheetResource)=>any):GameStateModel {
         if(!this.loader){
            throw new Error("Cannot fetch data source before data source is initialized.\nCall model.initData(loader) before calling this.");
         }
         if(this._gameData){
            then && then(this._gameData);
         }
         else {
            this.loader.loadAsType(this.googSpreadsheetId,pow2.GoogleSpreadsheetResource,(resource:pow2.GoogleSpreadsheetResource) => {
               this._gameData = resource;
               then && then(resource);
            });
         }
         return this;
      }


      addInventory(item:ItemModel):ItemModel {
         this.inventory.push(item);
         return item;
      }
      // Remove an inventory item.  Return true if the item was removed, or false
      // if it was not found.
      removeInventory(item:ItemModel):boolean{
         for(var i = 0; i < this.inventory.length; i++) {
            if(this.inventory[i].cid === item.cid){
               this.inventory.splice(i, 1);
               return true;
            }
         }
         return false;
      }


      addHero(model:HeroModel){
         this.party.push(model);
         model.game = this;
      }

      addGold(amount:number){
         this.set({ gold: this.attributes.gold + amount});
      }

      parse(data:any,options?:any):any {
         try{
            if(typeof data === 'string'){
               data = JSON.parse(data);
            }
         }
         catch(e){
            console.log("Failed to load save game.");
            return {};
         }
         this.inventory = _.map(data.inventory,(item:any) => {
            switch(item.itemType){
               case "armor":
                  var armor = _.where(pow2.getData('armor'),{name:item.name})[0];
                  return new ArmorModel(armor);
                  break;
               case "weapon":
                  var armor = _.where(pow2.getData('weapons'),{name:item.name})[0];
                  return new WeaponModel(armor);
                  break;
            }
            throw new Error("Unknown item type: " + item.itemType);
         });
         this.party = _.map(data.party,(partyMember) => {
            return new HeroModel(partyMember,{parse:true});
         });
         return _.omit(data,'party','inventory');
      }

      toJSON() {
         var result = super.toJSON();
         result.party = _.map(this.party,(p) => {
            return p.toJSON();
         });
         result.inventory = _.map(this.inventory,(p) => {
            return <any>_.pick(p.attributes,'name','itemType');
         });
         return result;
      }
   }
}
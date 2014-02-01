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
/// <reference path="../../core/api.ts" />
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
                  var armor = _.where(pow2.data.armor,{name:item.name})[0];
                  return new ArmorModel(armor);
                  break;
               case "weapon":
                  var armor = _.where(pow2.data.weapons,{name:item.name})[0];
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
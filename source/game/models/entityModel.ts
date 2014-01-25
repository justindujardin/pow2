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
module pow2 {
   var maxLevel = 50;

   export interface EntityModelOptions {
      name:string;
      icon:string; // The file name of a sprite source file
      level?:number;
      hp?:number;
      maxHP?:number;
      exp?:number;
      strength?:number;
      vitality?:number;
      intelligence?:number;
      agility?:number;
      dead?:boolean;
   }

   export class EntityModel extends Backbone.Model {
      static DEFAULTS:EntityModelOptions = {
         name:"Nothing",
         icon:"",
         level:1,
         hp:0,
         maxHP: 0,
         strength: 5,
         vitality: 4,
         intelligence: 1,
         agility: 1,
         dead:false
      };
      defaults():any {
         return _.extend({},EntityModel.DEFAULTS);
      }

      damage(amount:number){
         if(amount < 0){
            return;
         }
         this.set({hp: Math.max(0,this.attributes.hp - amount)});
         if(this.attributes.hp < 0){
            this.set({dead:true});
         }
      }

      isDefeated():boolean {
         return this.attributes.hp <= 0;
      }

      attack(defender:EntityModel):number{
         var halfStrength = this.attributes.strength / 2;
         defender.damage(halfStrength);
         return halfStrength;
      }
   }
}
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
   var maxAttr = 255;
   var baseExperience = 3;
   var experienceFactor = 1.75;
   export function getXPForLevel(character,level){
      if(level === undefined){
         level = character.level;
      }

      // TODO: Need to add all previous levels to this.
      return Math.floor(baseExperience * Math.pow(level,experienceFactor));
   }

   export function getHPForLevel(character:EntityModel,level?:number){
      if(typeof level === 'undefined') {
         level = character.get('level');
      }
      var vitality = level * character.get('vitality');
      return Math.floor(vitality * Math.pow(level,1)) + 15;
      //return vitality * (maxAttr / maxLevel) + 30;
   }

   export function enemyPlayer(level){
      var vitality:number = 3;
      return new EntityModel({
         strength:3,
         vitality:vitality,
         intelligence:1,
         agility:3,
         name:"Slime",
         level:level,
         hp:Math.floor(Math.pow(level + vitality,1.95)),
         exp:level * 2
      });
   }

   export function friendlyPlayer(level) {
      var tpl:EntityModel = new EntityModel({
         name:"Hero",
         level:level,
         exp: 0
      });
      var levelHitPoints = getHPForLevel(tpl);
      tpl.set({
         hp: levelHitPoints,
         maxHP: levelHitPoints
      });
      return tpl;
   }

   export class EntityModel extends Backbone.Model {
      static DEFAULTS:any = {
         name:"Nothing",
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
         this.set({hp: Math.max(0,this.attributes.hp - amount)});
         if(this.attributes.hp < 0){
            this.set({dead:true});
         }
      }

      attack(defender:EntityModel):number{
         var agility = this.attributes.level * (this.attributes.agility / maxLevel);
         var damage = Math.floor((this.attributes.strength + agility) * Math.random());
         defender.damage(damage);
         return damage;
      }
   }
}
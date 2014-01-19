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
/// <reference path="./creatureModel.ts" />
module pow2 {
   var maxLevel = 50;
   var maxAttr = 255;
   var baseExperience = 3;
   var experienceFactor = 1.75;

   export enum HeroType {
      Warrior = 1,
      Archer = 2
   }
   export interface HeroModelOptions extends EntityModelOptions {
      type:HeroType;
      experience:number;

      description:string; // An description of the hero.
   }
   export class HeroModel extends EntityModel {
      static DEFAULTS:HeroModelOptions = {
         name: "Hero",
         icon: "warrior.png",
         type: HeroType.Warrior,
         level: 1,
         experience:0,
         hp:0,
         maxHP: 6,
         description: ""
      };
      getXPForLevel(level=this.attributes.level){
         // TODO: Need to add all previous levels to this.
         return Math.floor(baseExperience * Math.pow(level,experienceFactor));
      }

      defaults():any {
         return _.extend(super.defaults(), HeroModel.DEFAULTS);
      }

      awardExperience(defeated:CreatureModel){
         var experience:number = defeated.get('experienceValue');
         var newExp:number = this.attributes.experience + experience;
         var nextLevel:number = this.attributes.level+1;
         var nextLevelExp:number = this.getXPForLevel(nextLevel);
         if(newExp >= nextLevelExp){
            this.set({
               level: nextLevel,
               maxHP: HeroModel.getHPForLevel(this,nextLevel),
               experience:newExp
            });
            this.trigger('levelUp',this);
         }
         else{
            this.set({
               experience:newExp
            });
         }
      }

      static getHPForLevel(character:HeroModel,level?:number){
         if(typeof level === 'undefined'){
            level = character.get('level');
         }
         var vitality = level * character.get('vitality');
         return Math.floor(vitality * Math.pow(level,1)) + 15;
         //return vitality * (maxAttr / maxLevel) + 30;
      }



      static create(type:HeroType){
         var character = new HeroModel({
            type:type
         });
         var level:number = 1;
         var vitality = level * character.get('vitality');
         var maxHP:number = HeroModel.getHPForLevel(character,level);
         character.set({
            hp:maxHP,
            maxHP:maxHP,
            strength:5,
            vitality:6,
            intelligence:1,
            agility:2
         });
         return character;
      }
   }
}
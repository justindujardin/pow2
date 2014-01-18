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
module pow2 {

   export enum HeroType {
      Warrior = 1,
      Archer = 2
   }
   export interface HeroModelOptions extends EntityModelOptions {
      type:HeroType;
      description:string; // An description of the hero.
   }
   export class HeroModel extends EntityModel {
      static DEFAULTS:HeroModelOptions = {
         name: "Hero",
         icon: "warrior.png",
         type: HeroType.Warrior,
         level: 1,
         hp:0,
         maxHP: 6,
         description: ""
      };

      defaults():any {
         return _.extend(super.defaults(), HeroModel.DEFAULTS);
      }

      static create(type:HeroType){
         var character = new HeroModel({
            type:type
         });
         var level:number = 1;
         var vitality = level * character.get('vitality');
         var maxHP:number = Math.floor(vitality * Math.pow(level,1)) + 15;
         character.set({
            hp:maxHP,
            maxHP:maxHP
         });
         return character;
      }
   }
}
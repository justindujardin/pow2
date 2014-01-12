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
/// <reference path="./EntityModel.ts" />
module pow2 {

   export interface CreatureModelOptions {
      name:string; // The creature name
      icon:string; // The file name of a sprite source file
      groups: string[]; // Named groups this creature belongs to
      level:number;
      minHP:number;
      maxHP:number;
      experienceValue:number;
      numAttacks:number;
      armorClass:number;
      description:string; // An description of the creature.
   }
   export class CreatureModel extends EntityModel {
      static DEFAULTS:CreatureModelOptions = {
         name: "Unnamed",
         icon: "cavePeeper.png",
         groups: [],
         level: 1,
         minHP: 2,
         maxHP: 6,
         experienceValue: 5,
         numAttacks: 1,
         armorClass: 2,
         description: ""
      };

      defaults():any {
         return _.extend(super.defaults(), CreatureModel.DEFAULTS);
      }

      static fromName(name:string){
         var creatures = pow2.getData('creatures');
         var cData:CreatureModelOptions = <CreatureModelOptions>_.where(creatures,{name:name})[0];
         var creature:CreatureModel = new CreatureModel(cData);
         creature.set({
            hp:Math.floor(Math.random() * (cData.maxHP - cData.minHP + 1)) + cData.minHP
         });
         return creature;

      }
      static fromLevel(level:number){
         var creatures = pow2.getData('creatures');
         if(!creatures){
            throw new Error("Creature data set is missing.");
         }
         var templates:CreatureModelOptions[] = <CreatureModelOptions[]>_.where(creatures,{level:level});
         var cData = templates[Math.floor(Math.random()*templates.length)];
         var creature:CreatureModel = new CreatureModel(cData);
         creature.set({
            hp:Math.floor(Math.random() * (cData.maxHP - cData.minHP + 1)) + cData.minHP
         });
         return creature;

      }

   }
}
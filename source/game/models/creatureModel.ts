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

   export interface CreatureModelOptions extends EntityModelOptions {
      name:string; // The creature name
      icon:string; // The file name of a sprite source file
      groups: string[]; // Named groups this creature belongs to
      level:number;
      hp:number;
      strength:number;
      numAttacks:number;
      armorClass:number;
      description:string; // An description of the creature.
   }
   export class CreatureModel extends EntityModel {
      static DEFAULTS:CreatureModelOptions = {
         name: "Unnamed Creature",
         icon: "noIcon.png",
         groups: [],
         level: 0,
         hp: 0,
         exp: 0,
         strength:0,
         numAttacks: 0,
         armorClass: 0,
         description: ""
      };

      defaults():any {
         return _.extend(super.defaults(), CreatureModel.DEFAULTS);
      }

      attack(defender:EntityModel):number{
         var damage = Math.floor((this.attributes.strength + this.attributes.agility) * Math.random() + this.attributes.strength);
         defender.damage(damage);
         return damage;
      }


      static fromName(name:string){
         var creatures = pow2.data.creatures;
         var cData:CreatureModelOptions = <CreatureModelOptions>_.where(creatures,{name:name})[0];
         return new CreatureModel(cData);

      }
      static fromLevel(level:number){
         var creatures = pow2.data.creatures;
         if(!creatures){
            throw new Error("Creature data set is missing.");
         }
         var templates:CreatureModelOptions[] = <CreatureModelOptions[]>_.where(creatures,{level:level});
         var cData = templates[Math.floor(Math.random()*templates.length)];
         return new CreatureModel(cData);

      }

   }
}
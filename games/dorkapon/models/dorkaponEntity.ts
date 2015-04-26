/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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

/// <reference path="../index.ts" />

module dorkapon.models {

  /**
   * The model attributes of a dorkapon entity
   */
  export interface IDorkaponEntityAttributes {
    name:string;

    //
    type:string;

    icon:string;
    moves:number;

    level:number;
    exp:number;

    hp:number;
    maxhp:number;

    attack:number;
    defense:number;
    magic:number;
    speed:number;
  }

  export class DorkaponEntity extends Backbone.Model {
    attributes:IDorkaponEntityAttributes;
    static DEFAULTS:IDorkaponEntityAttributes = {
      name: "InvalidName",
      type: "InvalidClass",
      icon: "",
      moves: 0,

      level: 1,
      exp: 0,

      hp: 1,
      maxhp: 1,

      attack: 1,
      defense: 1,
      magic: 1,
      speed: 1
    };

    defaults():any {
      return _.extend({}, DorkaponEntity.DEFAULTS);
    }

    /**
     * Apply a given amount of damage to this entity.  If the HP falls
     * below zero, it will be set to zero.
     *
     * @param value The amount of damage to apply.
     */
    damage(value:number) {
      this.set('hp', this.attributes.hp - value);
      if (this.attributes.hp < 0) {
        this.set('hp', 0);
      }
    }

    /**
     * Determine if a player is defeated.
     * @returns {boolean} True if the player's hp is 0.
     */
    isDefeated():boolean {
      return this.attributes.hp <= 0;
    }

    getAttack():number {
      return this.attributes.attack;
    }

    getDefense():number {
      return this.attributes.defense;
    }

    getMagic():number {
      return this.attributes.magic;
    }

    getSpeed():number {
      return this.attributes.speed;
    }
  }
}
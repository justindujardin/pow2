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
   * The model attributes of a dorkapon player
   */
  export interface IDorkaponPlayerAttributes extends IDorkaponEntityAttributes {
    basehp:number;
    baseattack:number;
    basedefense:number;
    basemagic:number;
    basespeed:number;

    levelhp:number;
    levelattack:number;
    leveldefense:number;
    levelmagic:number;
    levelspeed:number;


    armor:IDorkaponEquipment;
    weapon:IDorkaponEquipment;
    offenseMagic:IDorkaponEquipment;
    defenseMagic:IDorkaponEquipment;
  }

  export class DorkaponPlayer extends DorkaponEntity {
    attributes:IDorkaponPlayerAttributes;
    static DEFAULTS:IDorkaponPlayerAttributes = <any>{
      basehp: 1,
      baseattack: 1,
      basedefense: 1,
      basemagic: 1,
      basespeed: 1,

      levelhp: 10,
      levelattack: 1,
      leveldefense: 1,
      levelmagic: 1,
      levelspeed: 1,

      armor: null,
      weapon: null,
      offenseMagic: null,
      defenseMagic: null
    };

    defaults():any {
      return _.extend(super.defaults(), DorkaponPlayer.DEFAULTS);
    }


    getAttack():number {
      var base:number = this.attributes.attack;
      if (this.attributes.weapon) {
        base += this.attributes.weapon.attack;
      }
      if (this.attributes.armor) {
        base += this.attributes.armor.attack;
      }
      return base;
    }

    getDefense():number {
      var base:number = this.attributes.defense;
      if (this.attributes.weapon) {
        base += this.attributes.weapon.defense;
      }
      if (this.attributes.armor) {
        base += this.attributes.armor.defense;
      }
      return base;
    }

    getMagic():number {
      var base:number = this.attributes.magic;
      if (this.attributes.weapon) {
        base += this.attributes.weapon.magic;
      }
      if (this.attributes.armor) {
        base += this.attributes.armor.magic;
      }
      return base;
    }

    getSpeed():number {
      var base:number = this.attributes.speed;
      if (this.attributes.weapon) {
        base += this.attributes.weapon.speed;
      }
      if (this.attributes.armor) {
        base += this.attributes.armor.speed;
      }
      return base;
    }

    static create(options:IDorkaponPlayerAttributes):DorkaponPlayer {
      var result = new DorkaponPlayer(options);
      if (_.isUndefined(options.magic)) {
        result.set({magic: options.basemagic});
      }
      if (_.isUndefined(options.attack)) {
        result.set({attack: options.baseattack});
      }
      if (_.isUndefined(options.speed)) {
        result.set({speed: options.basespeed});
      }
      if (_.isUndefined(options.defense)) {
        result.set({defense: options.basedefense});
      }
      result.set({
        hp: result.attributes.basehp,
        maxhp: result.attributes.basehp
      });
      return result;

    }
  }
}
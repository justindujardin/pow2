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
  export interface IDorkaponMonsterAttributes extends IDorkaponEntityAttributes {
  }

  export class DorkaponMonster extends DorkaponEntity {
    attributes:IDorkaponMonsterAttributes;
    static DEFAULTS:IDorkaponMonsterAttributes = <any>{
      name: "InvalidName",
      type: "InvalidClass",
      icon: "",

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
      return _.extend(super.defaults(), DorkaponMonster.DEFAULTS);
    }

    static create(options:any):DorkaponMonster {
      var result = new DorkaponMonster(options);
      result.set({
        hp: result.attributes.hp,
        maxhp: result.attributes.hp
      });
      return result;

    }
  }
}
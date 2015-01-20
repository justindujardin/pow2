/*
 Copyright (C) 2013-2014 by Justin DuJardin and Contributors

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
      basestrength:number;
      basevitality:number;
      baseintelligence:number;
      baseagility:number;

      levelhp:number;
      levelstrength:number;
      levelvitality:number;
      levelintelligence:number;
      levelagility:number;
   }

   export class DorkaponPlayer extends DorkaponEntity {
      attributes:IDorkaponPlayerAttributes;
      static DEFAULTS:IDorkaponPlayerAttributes = <any>{
         basehp:1,
         basestrength:1,
         basevitality:1,
         baseintelligence:1,
         baseagility:1,

         levelhp:10,
         levelstrength:1,
         levelvitality:1,
         levelintelligence:1,
         levelagility:1
      };
      defaults():any {
         return _.extend(super.defaults(),DorkaponPlayer.DEFAULTS);
      }

      static create(options:any):DorkaponPlayer{
         var result = new DorkaponPlayer(options);
         result.set({
            hp:result.get('basehp'),
            maxhp:result.get('basehp')
         });
         return result;

      }
   }
}
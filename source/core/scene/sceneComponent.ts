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

/// <reference path="../api.ts" />
/// <reference path="./scene.ts" />

module pow2 {

   /**
    * Simplest ISceneComponent implementation.  Because Typescript interfaces are compile
    * time constructs, we have to have an actual implementation to instanceof.  For that
    * reason, all SceneComponents should derive this class.
    */
   export class SceneComponent extends Events implements ISceneComponent {
      id:string = _.uniqueId('sc');
      host:SceneObject;
      constructor(public name:string = _.uniqueId('comp')){
         super();
      }
      connectComponent():boolean {
         return true;
      }
      disconnectComponent():boolean {
         return true;
      }
      syncComponent():boolean {
         return true;
      }

      toString():string {
         var ctor:any = this.constructor;
         if (ctor && ctor.name != "Function") {
            return ctor.name || (this.toString().match(/function (.+?)\(/) || [, ''])[1];
         } else {
            return this.name;
         }
      }
   }

   /**
    * A component that supports tick/interpolateTick
    */
   export class TickedComponent extends SceneComponent {
      tickRateMS:number = 300;

      /**
       * Update the component at a tick interval.
       */
      tick(elapsed:number) {}

      /**
       * Interpolate component state between ticks.
       */
      interpolateTick(elapsed:number){}
   }
}
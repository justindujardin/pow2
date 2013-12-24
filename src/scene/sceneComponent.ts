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

/// <reference path="../typedef/underscore/underscore.d.ts" />
/// <reference path="./scene.ts" />

// An object that may exist in a `Scene`, has a unique `id` and receives ticked updates.
module eburp {


   /**
    * Basic component interface.  Supports component host lifetime implementations, and
    * hot-swapping components.
    */
   export interface ISceneComponent extends IObject {

      /**
       * The host object that this component belongs to.
       */
      host:SceneObject;

      /**
       * Connect this component to its host.  Initialization logic goes here.
       */
      connectComponent():boolean;
      /**
       * Disconnect this component from its host.  Destruction logic goes here.
       */
      disconnectComponent():boolean;

      /**
       * Components on the host have changed.  If this component depends on other
       * host object components, the references to them should be looked up and
       * stored here.
       */
      syncComponent();
   }

   /**
    * Simplest ISceneComponent implementation.  Because Typescript interfaces are compile
    * time constructs, we have to have an actual implementation to instanceof.  For that
    * reason, all SceneComponents should derive this class.
    */
   export class SceneComponent implements ISceneComponent {
      id:number = _.uniqueId();
      name:string = _.uniqueId('comp');
      scene: Scene;
      host:SceneObject;
      connectComponent():boolean { return true; }
      disconnectComponent():boolean { return true; }
      syncComponent() {}
   }

   /**
    * A component that supports tick/interpolateTick
    */
   export class TickedComponent extends SceneComponent {

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
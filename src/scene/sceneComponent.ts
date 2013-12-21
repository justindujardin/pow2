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
      host:SceneObject;
      registerComponent():boolean;
      unregisterComponent():boolean;
      refreshComponent();
   }

   /**
    * Simplest ISceneComponent implementation.  Because Typescript interfaces are compile
    * time constructs, we have to have an actual implementation to instanceof.  For that
    * reason, all SceneComponents should derive this class.
    */
   export class SceneComponent implements ISceneComponent {
      id:number = _.uniqueId();
      name:string = "";
      scene: Scene;
      host:SceneObject;

      registerComponent():boolean {
         return true;
      }
      unregisterComponent():boolean {
         return true;
      }
      refreshComponent() {}
   }
}
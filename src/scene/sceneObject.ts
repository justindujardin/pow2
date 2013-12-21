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
/// <reference path="./sceneComponent.ts" />

// An object that may exist in a `Scene`, has a unique `id` and receives ticked updates.
module eburp {

   export interface IObject {
      id:number;
      name:string;
   }

   /**
    * Basic component host object interface.  Exposes methods for adding/removing/searching
    * components that a host owns.
    */
   export interface ISceneComponentHost extends IObject {
      addComponent(component:ISceneComponent):boolean;
      removeComponent(component:ISceneComponent):boolean;

      findComponent(type:Function):ISceneComponent;
      findComponents(type:Function):ISceneComponent[];
   }

   export class SceneObject implements ISceneComponentHost {
      id:number = _.uniqueId();
      name:string = "";
      scene: Scene = null;
      world: IWorld = null;
      _components:ISceneComponent[] = [];
      constructor(options?: any) {
         if(options){
            _.extend(this, _.defaults(options) || {});
         }
      }

      // Tick components.
      tick(elapsed: number) {
         _.each(this._components,(o:any) => {
            if(o.tick){
               o.tick(elapsed);
            }
         });
      }

      // Interpolate components.
      interpolateTick(elapsed: number) {
         _.each(this._components,(o:any) => {
            if(o.interpolateTick){
               o.interpolateTick(elapsed);
            }
         });
      }

      destroy() {
         if (this.scene) {
            this.scene.removeObject(this);
         }
      }

      // ISceneComponentHost implementation
      // -----------------------------------------------------------------------------

      findComponent(type:Function):ISceneComponent {
         return _.find(this._components,(comp:ISceneComponent) => {
            return comp instanceof type;
         });
      }
      findComponents(type:Function):ISceneComponent[] {
         return [];
      }

      // TODO: These two methods should make use of the component.refreshComponent()
      // methods, to allow components to maintain references to siblings on the host,
      // and not blow up horribly when one goes away.

      addComponent(component:ISceneComponent):boolean {
         if(_.where(this._components,{id: component.id}).length > 0){
            throw new Error("Component added twice");
         }
         component.host = this;
         if(component.registerComponent() === false){
            delete component.host;
            console.log("Component " + component.name + " failed to register.");
            return false;
         }
         this._components.push(component);
         return false;
      }

      removeComponent(component:ISceneComponent):boolean{
         var previousCount:number = this._components.length;
         this._components = _.filter(this._components, (obj:SceneComponent) => {
            if(obj.id === component.id){
               if(obj.unregisterComponent() === false){
                  return true;
               }
               obj.host = null;
               return false;
            }
            return true;
         });
         return this._components.length === previousCount;
      }


   }
}
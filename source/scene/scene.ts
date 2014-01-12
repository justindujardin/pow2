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

/// <reference path="../../types/underscore/underscore.d.ts" />
/// <reference path="../core/time.ts"/>
/// <reference path="../core/world.ts"/>
/// <reference path="./sceneObject.ts"/>
/// <reference path="./sceneView.ts"/>
/// <reference path="./sceneSpatialDatabase.ts"/>

module pow2 {


   export interface ISceneEvents {
      on?(eventName: any, callback?: Function, context?: any): any;
      off?(eventName?: string, callback?: Function, context?: any): any;
      trigger?(eventName: string, ...args: any[]): any;
      bind?(eventName: string, callback: Function, context?: any): any;
      unbind?(eventName?: string, callback?: Function, context?: any): any;

      once?(events: string, callback: Function, context?: any): any;
      listenTo?(object: any, events: string, callback: Function): any;
      listenToOnce?(object: any, events: string, callback: Function): any;
      stopListening?(object?: any, events?: string, callback?: Function): any;
   }


   // Backbone.Events does not work with extend in Typescript, so use this
   // base class to all extends to work with proper type information.
   // TODO: This is kind of bad for different versions of Backbone.
   export class SceneEvents implements ISceneEvents {
      constructor() {}
      on(eventName: any, callback?: Function, context?: any): any {}
      off(eventName?: string, callback?: Function, context?: any): any {}
      trigger(eventName: string, ...args: any[]): any {}
      bind(eventName: string, callback: Function, context?: any): any {}
      unbind(eventName?: string, callback?: Function, context?: any): any {}
      once(events: string, callback: Function, context?: any): any {}
      listenTo(object: any, events: string, callback: Function): any {}
      listenToOnce(object: any, events: string, callback: Function): any {}
      stopListening(object?: any, events?: string, callback?: Function): any {}
   }
   _.extend(SceneEvents.prototype,Backbone.Events);

   export class Scene extends SceneEvents implements IProcessObject, IWorldObject {
      id:number = _.uniqueId();
      name:string = _.uniqueId('scene');
      db:SceneSpatialDatabase = new SceneSpatialDatabase;
      options:any = {};
      private _objects = [];
      private _views:SceneView[] = [];
      world:IWorld = null;
      fps:number = 0;
      time:number = 0;
      paused:boolean = false;

      constructor(options:any={}){
         super();
         this.options = _.defaults(options || {},{
            debugRender:false
         });
      }

      destroy() {
         this.world.erase(this);
         _.each(this._objects,(obj) => {
            this.removeObject(obj,true);
         });
         _.each(this._views,(obj) => {
            this.removeView(obj);
         });
         this.paused = true;

      }

      // IWorldObject
      // -----------------------------------------------------------------------------
      onAddToWorld(world:IWorld){
         world.time.addObject(this);
      }
      onRemoveFromWorld(world:IWorld){
         world.time.removeObject(this);
      }

      // IProcessObject
      // -----------------------------------------------------------------------------
      tick(elapsed:number) {
         if(this.paused){
            return;
         }
         for(var i = 0; i < this._objects.length; i++){
            this._objects[i].tick(elapsed);
         }
      }
      processFrame(elapsed:number) {
         if(this.paused){
            return;
         }
         this.time = this.world.time.time;
         // Interpolate objects.
         for(var i = 0; i < this._objects.length; i++){
            var o = this._objects[i];
            if(o.interpolateTick){
               o.interpolateTick(elapsed);
            }
         }
         // Render frame.
         for(var i = 0; i < this._views.length; i++){
            this._views[i]._render(elapsed);
         }
         // Update FPS
         var currFPS:number = elapsed ? 1000 / elapsed : 0;
         this.fps += (currFPS - this.fps) / 10;
      }

      // Object add/remove helpers.
      // -----------------------------------------------------------------------------
      removeIt(property:string,object:any){
         this[property] = _.filter(this[property], (obj:any) => {
            if(obj.id === object.id){
               this.db.removeSpatialObject(obj);
               if(obj.onRemoveFromScene){
                  obj.onRemoveFromScene(this);
               }
               if(this.world){
                  this.world.erase(obj);
               }
               delete obj.scene;
               return false;
            }
            return true;
         });
      }

      addIt(property:string,object:any){
         if(_.where(this[property],{ id: object.id}).length > 0){
            throw new Error("Object added to scene twice");
         }
         this[property].push(object);
         if(this.world){
            this.world.mark(object);
         }
         this.db.addSpatialObject(object);
         object.scene = this;
         if(object.onAddToScene){
            object.onAddToScene(this);
         }
      }

      findIt(property:string,object:any){
         return _.where(this[property],{id:object.id});
      }


      // View management
      // -----------------------------------------------------------------------------

      addView(view) {
         if(!(view instanceof SceneView)){
            throw new Error("Scene.addView: must be a SceneView");
         }
         this.addIt('_views',view);
      }

      removeView(view){
         this.removeIt('_views',view);
      }

      findView(view){
         return this.findIt('_views',view);
      }

      // SceneObject management
      // -----------------------------------------------------------------------------
      addObject(object) {
         if(!(object instanceof SceneObject)){
            throw new Error("Scene.addObject: must be a SceneObject");
         }
         this.addIt('_objects',object);
      }
      removeObject(object:SceneObject,destroy:boolean=true){
         this.removeIt('_objects',object);
         if(destroy){
            object.destroy();
         }
      }
      findObject(object){
         return this.findIt('_objects',object);
      }


      componentsByType(type) {
         return _.chain(this._objects)
            .map((o:ISceneComponentHost) => {
               return o.findComponents(type);
            })
            .flatten()
            .compact()
            .value();
      }


      objectsByType(type) {
         return _.filter(this._objects, (o) => {
            return o instanceof type;
         });
      }
      objectByType(type) {
         return _.find(this._objects, (o) => {
            return o instanceof type;
         });
      }
      objectsByComponent(type) {
         return _.filter(this._objects, (o) => {
            return !!o.findComponent(type);
         });
      }
      objectByComponent(type) {
         return _.find(this._objects, (o) => {
            return !!o.findComponent(type);
         });
      }
   }
}
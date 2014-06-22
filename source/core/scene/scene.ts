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

/// <reference path="../../../types/underscore/underscore.d.ts" />
/// <reference path="../time.ts"/>
/// <reference path="../world.ts"/>
/// <reference path="./sceneObject.ts"/>
/// <reference path="./sceneView.ts"/>
/// <reference path="./sceneSpatialDatabase.ts"/>

module pow2 {

   export class Scene extends Events implements IProcessObject, IWorldObject {
      id:string;
      _uid:string = _.uniqueId('scene');
      name:string;
      db:SceneSpatialDatabase = new SceneSpatialDatabase;
      options:any = {};
      private _objects:SceneObject[] = [];
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
         if(this.world){
            this.world.erase(this);
         }
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
         var l:number = this._objects.length;
         for(var i = 0; i < l; i++){
            this._objects[i] && this._objects[i].tick(elapsed);
         }
      }
      processFrame(elapsed:number) {
         if(this.paused){
            return;
         }
         this.time = this.world.time.time;
         // Interpolate objects.
         var l:number = this._objects.length;
         for(var i = 0; i < l; i++){
            var o = this._objects[i];
            if(o.interpolateTick){
               o.interpolateTick(elapsed);
            }
         }
         // Render frame.
         l = this._views.length;
         for(var i = 0; i < l; i++){
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
            if(obj._uid === object._uid){
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

         // Remove object from any scene it might already be in.
         if(object.scene){
            object.scene.removeIt(property,object);
         }

         // Check that we're not adding this twice (though, I suspect the above
         // should make that pretty unlikely)
         if(_.where(this[property],{ _uid: object._uid}).length > 0){
            throw new Error("Object added to scene twice");
         }
         this[property].push(object);
         // Mark it in the scene's world.
         if(this.world){
            this.world.mark(object);
         }
         // Add to the scene's spatial database
         this.db.addSpatialObject(object);

         // Mark it in this scene, and trigger the onAdd
         object.scene = this;
         if(object.onAddToScene){
            object.onAddToScene(this);
         }
      }

      findIt(property:string,object:any){
         return _.where(this[property],{_uid:object._uid});
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

      componentByType(type):ISceneComponent {
         var values:any[] = this._objects;
         var l:number = this._objects.length;
         for(var i = 0; i < l; i++){
            var o:SceneObject = values[i];
            var c:ISceneComponent = o.findComponent(type);
            if(c){
               return c;
            }
         }
         return null;
      }

      componentsByType(type):ISceneComponent[] {
         var values:any[] = this._objects;
         var l:number = this._objects.length;
         var results:ISceneComponent[] = [];
         for(var i = 0; i < l; i++){
            var o:SceneObject = values[i];
            var c:ISceneComponent[] = o.findComponents(type);
            if(c){
               results = results.concat(c);
            }
         }
         return results;
      }


      objectsByName(name:string):SceneObject[] {
         var values:any[] = this._objects;
         var l:number = this._objects.length;
         var results:SceneObject[] = [];
         for(var i = 0; i < l; i++){
            var o:SceneObject = values[i];
            if(o.name === name){
               results.push(o);
            }
         }
         return results;
      }
      objectByName(name:string):SceneObject {
         var values:any[] = this._objects;
         var l:number = this._objects.length;
         for(var i = 0; i < l; i++){
            var o:SceneObject = values[i];
            if(o.name === name){
               return o;
            }
         }
         return null;
      }
      objectsByType(type):SceneObject[] {
         var values:any[] = this._objects;
         var l:number = this._objects.length;
         var results:SceneObject[] = [];
         for(var i = 0; i < l; i++){
            var o:SceneObject = values[i];
            if(o instanceof type){
               results.push(o);
            }
         }
         return results;
      }
      objectByType(type):SceneObject {
         var values:any[] = this._objects;
         var l:number = this._objects.length;
         for(var i = 0; i < l; i++){
            var o:SceneObject = values[i];
            if(o instanceof type){
               return o;
            }
         }
         return null;
      }
      objectsByComponent(type):SceneObject[] {
         var values:any[] = this._objects;
         var l:number = this._objects.length;
         var results:SceneObject[] = [];
         for(var i = 0; i < l; i++){
            var o:SceneObject = values[i];
            if(o.findComponent(type)){
               results.push(o);
            }
         }
         return results;
      }
      objectByComponent(type):SceneObject {
         var values:any[] = this._objects;
         var l:number = this._objects.length;
         for(var i = 0; i < l; i++){
            var o:SceneObject = values[i];
            if(o.findComponent(type)){
               return o;
            }
         }
         return null;
      }
   }
}
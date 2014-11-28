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
/// <reference path="./resources/audio.ts"/>
/// <reference path="./resources/image.ts"/>
/// <reference path="./resources/json.ts"/>
/// <reference path="./resources/script.ts"/>
/// <reference path="./resources/xml.ts"/>
/// <reference path="./world.ts"/>
/// <reference path="./time.ts"/>

module pow2 {

   var _shared:ResourceLoader=null;
   /**
    * A basic resource loading manager.  Supports a basic api for requesting
    * resources by file name, and uses registered types and file extension
    * matching to create and load a resource.
    */
   export class ResourceLoader implements IWorldObject, IProcessObject {
      private _cache:Object = {};
      private _types:Object = {
         'png':ImageResource,
         'js':ScriptResource,
         'json':JSONResource,
         'xml':XMLResource,
         '':AudioResource
      };
      private _doneQueue = [];
      _uid:string;
      world:IWorld = null;

      constructor(){
         this._uid = _.uniqueId('res');
      }

      static get():pow2.ResourceLoader {
         if(!_shared){
            _shared = new pow2.ResourceLoader();
         }
         return _shared;
      }

      // IWorldObject implementation
      onAddToWorld(world){
         world.time.addObject(this);
      }
      onRemoveFromWorld(world){
         world.time.removeObject(this);
      }

      // IProcessObject implementation
      tick(elapsed:number){}
      processFrame(elapsed:number) {
         // It is important that we create a secondary reference to doneQueue here
         // in case any of the done callbacks request resources that end up in the
         // queue.
         var doneQueue = this._doneQueue;
         this._doneQueue = [];
         _.each(doneQueue,function(done){
            done.cb(done.result);
         });
      }

      ensureType(extension:string,type:Function){
         this._types[extension] = type;
      }

      getResourceExtension(url:string):string {
         var index:number = url.lastIndexOf('.');
         if(index === -1){
            return '';
         }
         return url.substr(index+1);
      }

      create(typeConstructor:any,data:any):IResource {
         var type:Resource = <Resource>new typeConstructor(null,data);
         type.setLoader(this);
         return type;
      }

      loadAsType(source:string,resourceType:any,done?:any):IResource{
         var completeCb:any = (obj:any) => {
            if(this.world && done){
               this._doneQueue.push({cb:done,result:obj});
            }
            else if(done){
               _.defer(function() { done(obj); });
            }
         };
         if(!resourceType){
            completeCb(null);
            console.error("Unknown resource type: " + source);
            return;
         }

         var resource:Resource = this._cache[source];
         if(!resource){
            resource = this._cache[source] = new resourceType(source,this);
            resource.setLoader(this);
         }
         else if(resource.isReady()){
            return completeCb(resource);
         }

         resource.once('ready',(resource:IResource) => {
            console.log("Loaded asset: " + resource.url);
            completeCb(resource);
         });
         resource.once('failed',(resource:IResource) => {
            console.log("Failed to load asset: " + resource.url);
            completeCb(null);
         });
         resource.load();
         return resource;
      }

      load(sources:Array<string>,done?:Function):Array<Resource>;
      load(source:string,done?:Function):Resource;
      load(sources:any,done?:any):any{
         var results:Array<Resource> = [];
         var loadQueue:number = 0;
         if(!_.isArray(sources)){
            sources = [sources];
         }
         function _checkDone(){
            if(done && loadQueue === 0){
               var result:any = results.length > 1 ? results : results[0];
               done(result);
            }
         }
         for(var i:number = 0; i < sources.length; i++){
            var src:string = sources[i];
            var extension:string = this.getResourceExtension(src);
            var resourceType = this._types[extension];
            if(!resourceType){
               console.error("Unknown resource type: " + src);
               return;
            }
            var resource:Resource = this._cache[src];
            if(!resource){
               resource = this._cache[src] = new resourceType(src,this);
               resource.setLoader(this);
            }
            else if(resource.isReady()){
               results.push(resource);
               continue;
            }
            resource.extension = extension;
            loadQueue++;

            resource.once('ready',(resource:IResource) => {
               console.log("Loaded asset: " + resource.url);
               loadQueue--;
               _checkDone();
            });
            resource.once('failed',(resource:IResource) => {
               console.log("Failed to load asset: " + resource.url);
               loadQueue--;
               _checkDone();
            });
            resource.load();
            results.push(resource);

         }
         var obj:any = results.length > 1 ? results : results[0];
         if(loadQueue === 0){
            if(this.world && done){
               this._doneQueue.push({cb:done,result:obj});
            }
            else if(done){
               _.defer(function() { done(obj); });
            }
         }
         return obj;
      }
   }
}
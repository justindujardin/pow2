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

/// <reference path="../../types/backbone/backbone.d.ts"/>
/// <reference path="./resourceLoader.ts"/>
module pow2 {

   export interface IResource {
      url:string;
      data:any;
      extension:string;
      load();
      isReady():boolean;
      ready();
      failed(error:any);
   }

   /**
    * Basic asynchronous resource class.
    *
    * Supports loading and success/error handling. A resource is immediately
    * available, and you can get at its internal data when `isReady` returns true.
    *
    * pow2.Resource objects trigger 'ready' and 'failed' events during their initial loading.
    */
   export class Resource extends pow2.Events implements IResource{
      url:string;
      data:any;
      extension:string;
      loader:ResourceLoader = null;
      private _ready:boolean = false;
      constructor(url:string,data:any=null){
         super();
         this.url = url;
         this.data = data;
      }

      load() {
         console.log("Loading: " + this.url);
      }

      setLoader(loader:ResourceLoader) {
         this.loader = loader;
      }

      isReady():boolean {
         return this.data !== null && this._ready === true;
      }

      ready() {
         this._ready = true;
         this.trigger('ready',this);
      }
      failed(error:any){
         this._ready = false;
         console.log("ERROR loading resource: " + this.url + "\n   -> " + error);
         this.trigger('failed',this);
      }
   }
}
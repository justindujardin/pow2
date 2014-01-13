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

/// <reference path="../sceneComponent.ts" />
/// <reference path="../../core/resources/audio.ts" />

module pow2 {

   export interface SoundComponentOptions {
      url:string;
      loop?:boolean;
      volume?:number;
   }

   export class SoundComponent extends SceneComponent implements SoundComponentOptions {
      url:string;
      audio:AudioResource;
      constructor(options:SoundComponentOptions={
         url:null
      }){
         super();
         if(typeof options !== 'undefined'){
            _.extend(this,options);
         }
      }

      connectComponent():boolean {
         if(!super.connectComponent() || !this.url){
            return false;
         }
         this.audio = this.host.world.loader.load(this.url,() => {
            if(this.audio.isReady()){
               this.audio.data.play();
               this.audio.data.addEventListener('timeupdate',() => {
                  if(this.audio.data.currentTime >= this.audio.data.duration){
                     this.audio.data.pause();
                     this.trigger("audio:done",this);
                  }
               });
            }
         });
         return true;
      }
   }
}
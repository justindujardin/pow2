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

///<reference path="../../types/underscore/underscore.d.ts"/>

module pow2 {
   export interface IProcessObject {
      id:number;
      tick?(elapsed:number);
      processFrame?(elapsed:number);
   }

   export class Time {
      autoStart:boolean = false;
      tickRateMS:number = 32;
      mspf:number = 0;
      world:any = null;
      lastTime:number = 0;
      time:number = 0;
      running:boolean = false;
      objects:Array<IProcessObject> = [];
      constructor(options:Object){
         _.extend(this,options || {});
         this.polyFillAnimationFrames();
         if(this.autoStart){
            this.start();
         }
      }

      start() {
         if(this.running){
            return;
         }
         this.running = true;
         var _frameCallback:FrameRequestCallback = (time:number) => {
            this.time = Math.floor(time);
            var now:number = new Date().getMilliseconds();
            var elapsed:number = Math.floor(time - this.lastTime);
            if(elapsed >= this.tickRateMS){
               this.lastTime = time;
               this.tickObjects(elapsed);
            }
            this.processFrame(elapsed);
            this.mspf = new Date().getMilliseconds() - now;
            window.requestAnimationFrame(_frameCallback);
         };
         _frameCallback(0);
      }

      stop() {
         this.running = false;
      }

      removeObject(object:IProcessObject){
         this.objects = <IProcessObject[]>_.filter(this.objects,function (o:IProcessObject){
            return o.id != object.id;
         });
      }

      addObject(object:IProcessObject){
         if(_.where(this.objects,{id:object.id}).length > 0){
            return;
         }
         this.objects.push(object);
      }

      tickObjects(elapsedMS:number){
         _.each(this.objects, (o:IProcessObject) => {
            return o.tick && o.tick(elapsedMS);
         });
      }
      processFrame(elapsedMS:number){
         _.each(this.objects, (o:IProcessObject) => {
            return o.processFrame && o.processFrame(elapsedMS);
         });
      }

      polyFillAnimationFrames() {
         var lastTime:number = 0;
         var vendors:Array<string> = ['ms','moz','webkit','o'];
         for(var i:number = 0; i < vendors.length; i++){
            if(window.requestAnimationFrame){
               return;
            }
            window.requestAnimationFrame = window[vendors[i]+'RequestAnimationFrame'];
         }
         if(!window.requestAnimationFrame){
            window.requestAnimationFrame = function(callback:FrameRequestCallback):number{
               var currTime:number = new Date().getTime();
               var timeToCall:number = Math.max(0,16 - (currTime - lastTime));
               var tickListener:Function = function(){
                  callback(currTime + timeToCall);
               };
               var id:number = window.setTimeout(tickListener,timeToCall);
               lastTime = currTime + timeToCall;
               return id;
            };
         }
      }
   }
}
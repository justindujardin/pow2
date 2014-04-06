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

/// <reference path="../../../lib/pow2.d.ts" />
/// <reference path="../../tile/tileObject.ts" />

module pow2 {
   export class Animator{
      interpFrame:number = 0;
      animElapsed:number = 0;
      animDuration:number = 0;
      frames:number[] = [0];

      sourceMeta:any = null;
      sourceAnims:any = null;

      setAnimationSource(spriteName:string){
         console.log("Sprite is " + spriteName);
         this.sourceMeta = pow2.getSpriteMeta(spriteName);
         this.sourceAnims = this.sourceMeta.animations;
         this.setAnimation('down');
      }

      setAnimation(name:string){
         if(!this.sourceAnims){
            throw new Error("Invalid source animations");
         }
         var data:any = this.sourceAnims[name];
         if(!data){
            throw new Error("Invalid animation name - " + name);
         }
         this.frames = data.frames;
         this.animDuration = data.duration;
      }

      updateTime(elapsedMs:number){
         this.animElapsed += elapsedMs;
         var factor:number = this.animElapsed / this.animDuration;
         var index = Math.round(this.interpolate(0,this.frames.length-1,factor));
         this.interpFrame = this.frames[index];
         if(this.animElapsed > this.animDuration){
            this.animElapsed = this.animElapsed % this.animDuration;;
         }
      }

      interpolate(from:number,to:number,factor:number):number {
         factor = Math.min(Math.max(factor,0),1);
         return (from * (1.0 - factor)) + (to * factor);
      }

      getFrame():number {
         return this.interpFrame;
      }
   }
   
   
   export enum MoveFrames {
      LEFT = 10,
      RIGHT = 4,
      DOWN = 7,
      UP = 1,
      LEFTALT = 11,
      RIGHTALT = 5,
      DOWNALT = 8,
      UPALT = 2
   }

   // The order here maps to the first four frames in MoveFrames above.
   // It matters, don't change without care.
   export enum Headings {
      WEST = 0,
      EAST = 1,
      SOUTH = 2,
      NORTH = 3
   }
   export class PlayerRenderComponent extends TickedComponent {
      host:TileObject;
      _elapsed: number = 0;

      private _lastFrame:number = 6;
      private _renderFrame:number = 6;
      private _animator:Animator = new Animator();
      heading:Headings = Headings.WEST;
      animating:boolean = false;


      connectComponent():boolean{
         if(!super.connectComponent()){
            return false;
         }
         this._animator.setAnimationSource(this.host.icon);
         return true;
      }

      tick(elapsed:number){
         this._elapsed += elapsed;
         if (this._elapsed < this.tickRateMS) {
            return;
         }
         // Don't subtract elapsed here, but take the modulus so that
         // if for some reason we get a HUGE elapsed, it just does one
         // tick and keeps the remainder toward the next.
         this._elapsed = this._elapsed % this.tickRateMS;

         // There are four states and two rows.  The second row is all alt states, so mod it out
         // when a move ends.
         this._lastFrame = this._renderFrame;// > 3 ? this._renderFrame - 4 : this._renderFrame;
         super.tick(elapsed);
         //console.log("Heading: " + Headings[this.heading] + " - " + this.animating);
      }

      setHeading(direction:Headings,animating:boolean){
         this.heading = direction;
         switch(this.heading){
            case Headings.SOUTH:
               this._animator.setAnimation('down');
               break;
            case Headings.NORTH:
               this._animator.setAnimation('up');
               break;
            case Headings.EAST:
               this._animator.setAnimation('right');
               break;
            case Headings.WEST:
               this._animator.setAnimation('left');
               break;
         }
         this.animating = animating;
      }

      setMoving(moving:boolean){
         this.animating = moving;
      }

      interpolateTick(elapsed:number) {
         super.interpolateTick(elapsed);
         this._animator.updateTime(elapsed);
         this.host.frame = this._animator.getFrame();
      }
   }
}
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

/// <reference path="../../scene/components/movableComponent.ts" />
/// <reference path="../../scene/sceneComponent.ts" />
/// <reference path="../../tile/tileObject.ts" />

module pow2 {
   export enum MoveFrames {
      LEFT = 0,
      RIGHT = 1,
      DOWN = 2,
      UP = 3,
      LEFTALT = 4,
      RIGHTALT = 5,
      DOWNALT = 6,
      UPALT = 7
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

      private _lastFrame:number = 3;
      private _renderFrame:number = 3;
      heading:Headings = Headings.WEST;
      animating:boolean = false;
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
         this._lastFrame = this._renderFrame > 3 ? this._renderFrame - 4 : this._renderFrame;
         super.tick(elapsed);
      }

      setHeading(direction:Headings,animating:boolean){
         this.heading = direction;
         this.animating = animating;
      }

      setMoving(moving:boolean){
         this.animating = moving;
      }

      interpolateTick(elapsed:number) {
         super.interpolateTick(elapsed);

         // Choose frame for interpolated position
         var factor = this._elapsed / this.tickRateMS;
         var altFrame = !!((factor > 0.0 && factor < 0.5));
         var frame = this._lastFrame;

         frame = this.heading;
         if(altFrame && this.animating){
            frame += 4;
         }
         this.host.iconFrame = this._renderFrame = frame;
      }
   }
}
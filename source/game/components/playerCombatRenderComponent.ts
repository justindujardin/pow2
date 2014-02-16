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
/// <reference path="../objects/gameEntityObject.ts" />

module pow2.combat {
   export enum StateFrames {
      DEFAULT = 0,
      SWING = 1,
      INJURED = 2,
      WALK = 3,
      STRIKE = 4,
      DEAD = 5
   }
   export class PlayerCombatRenderComponent extends TickedComponent {
      host:pow2.GameEntityObject;
      _elapsed: number = 0;
      private _lastFrame:number = 3;
      private _renderFrame:number = 3;
      state:string = "";
      tick(elapsed:number){
         this._elapsed += elapsed;
         if (this._elapsed < this.tickRateMS) {
            return;
         }
         // Don't subtract elapsed here, but take the modulus so that
         // if for some reason we get a HUGE elapsed, it just does one
         // tick and keeps the remainder toward the next.
         this._elapsed = this._elapsed % this.tickRateMS;
         if(this.host.model){
            var health = this.host.model.get('hp');
            var maxHealth = Math.max(0.01,this.host.model.get('maxHP'));
            var ratio = health / maxHealth;
            if(ratio === 0){
               this.state = "Dead";
            }
            else if(ratio < 0.5) {
               this.state = "Injured";
            }
         }
         super.tick(elapsed);
      }

      setState(name:string="Default"){
         this.state = name;
      }

      interpolateTick(elapsed:number) {
         super.interpolateTick(elapsed);
         // Choose frame for interpolated position
         var factor = this._elapsed / this.tickRateMS;
         var altFrame = !!((factor > 0.0 && factor < 0.5));
         var frame = StateFrames.DEFAULT;
         switch(this.state){
            case "Injured":
               frame = StateFrames.INJURED;
               break;
            case "Dead":
               frame = StateFrames.DEAD;
               break;
            case "Attacking":
               frame = altFrame ? StateFrames.STRIKE : StateFrames.SWING;
               break;
            case "Moving":
               frame = altFrame ? StateFrames.WALK : StateFrames.DEFAULT;
               break;
         }
         this.host.frame = this._renderFrame = frame;
      }
   }
}
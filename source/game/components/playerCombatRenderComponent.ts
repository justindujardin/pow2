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
/// <reference path="./animatedComponent.ts" />
/// <reference path="../objects/gameEntityObject.ts" />

module pow2.combat {
   // TODO: Figure out serialization strategy.
   var attackAnimation = [
      {
         name : "Move Forward for Attack",
         duration : 300,
         repeats: 4,
         frames : [StateFrames.DEFAULT,StateFrames.WALK],
         move: new Point(-1,0)
      },
      {
         name : "Strike at Opponent",
         duration : 1500,
         repeats: 4,
         frames : [StateFrames.SWING,StateFrames.STRIKE]
      },
      {
         name : "Return to Party",
         duration : 300,
         repeats: 4,
         frames : [StateFrames.DEFAULT,StateFrames.WALK],
         move: new Point(1,0)
      }
   ];

   export enum StateFrames {
      DEFAULT = 0,
      SWING = 1,
      INJURED = 2,
      WALK = 3,
      STRIKE = 3,
      CELEBRATE = 4,
      DEAD = 5
   }
   export class PlayerCombatRenderComponent extends TickedComponent {
      host:pow2.GameEntityObject;
      _elapsed: number = 0;
      private _renderFrame:number = 3;
      state:string = "";
      private _animationKeys:any[] = [];
      private _currentAnim:any = null;
      private _animator:AnimatedComponent = null;

      syncComponent():boolean {
         this._animator = <AnimatedComponent>this.host.findComponent(AnimatedComponent);
         return super.syncComponent();
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

      private _cb:any;
      attack(cb:() => void) {
         this._animationKeys = _.map(attackAnimation,(anim) => {
            var result = _.extend({},anim);
            if(typeof result.move !== 'undefined'){
               result.move = result.move.clone();
            }
            return result;
         });
         this._cb = cb;
         this.animNext();
      }
      animNext() {
         if(!this._animator){
            return;
         }
         if(this._animationKeys.length === 0){
            this._cb && this._cb();
            this._cb = null;
            return;
         }
         this._currentAnim = this._animationKeys.shift();
         this._currentAnim.done = () => {
            _.defer(() => {
               this.animNext();
            });
         };
         this._animator.play(this._currentAnim);
      }

      interpolateTick(elapsed:number) {
         super.interpolateTick(elapsed);

         if(this._animator && this._animationKeys.length > 0){
            this._animator.update(elapsed);
         }
         else {
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
//               case "Moving":
//                  frame = altFrame ? StateFrames.WALK : StateFrames.DEFAULT;
//                  break;
            }
            this.host.frame = this._renderFrame = frame;
         }
      }
   }
}
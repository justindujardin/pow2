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

/// <reference path="../../game/components/animatedComponent.ts" />
/// <reference path="../../game/objects/gameEntityObject.ts" />

module pow2.combat {
   export enum StateFrames {
      DEFAULT = 10,
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
      animating:boolean = false;
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

      attack(attackCb:() => any, cb:() => void) {
         if(!this._animator || this.animating){
            return;
         }
         var attackAnimation = [
            {
               name : "Move Forward for Attack",
               repeats : 0,
               duration:250,
               frames : [9,11,10],
               move: new Point(-1,0),
               callback: () => {
                  this.host.setSprite(this.host.icon.replace(".png","-attack.png"),12);
               }
            },
            {
               name : "Strike at Opponent",
               repeats: 1,
               duration:500,
               frames : [12,13,14,15,14,13,12],
               callback: () => {
                  this.host.setSprite(this.host.icon.replace("-attack.png",".png"),10);
                  attackCb && attackCb();
               }
            },
            {
               name : "Return to Party",
               duration : 250,
               repeats: 0,
               frames : [10,11,9],
               move: new Point(1,0)
            }
         ];

         var animations:IAnimationConfig[] = _.map(attackAnimation,(anim:IAnimationConfig) => {
            var result = _.extend({},anim);
            if(typeof result.move !== 'undefined'){
               result.move = result.move.clone();
            }
            return result;
         });
         this.animating = true;
         this._animator.playChain(animations,() => {
            this.animating = false;
            cb && cb();
         });
      }

      magic(attackCb:() => any, cb:() => void) {
         if(!this._animator || this.animating){
            return;
         }
         var magicAnimation = [
            {
               name : "Magic cast",
               repeats: 0,
               duration:1000,
               frames : [19,18,17,16,15],
               callback: () => {
                  attackCb && attackCb();
               }
            },
            {
               name : "Back to rest",
               repeats: 0,
               duration:1000,
               frames : [15,16,17,18,19],
               callback: () => {
                  this.host.setSprite(this.host.icon.replace("-magic.png",".png"),10);
               }
            }

         ];
         var animations:IAnimationConfig[] = _.map(magicAnimation,(anim:IAnimationConfig) => {
            var result = _.extend({},anim);
            if(typeof result.move !== 'undefined'){
               result.move = result.move.clone();
            }
            return result;
         });
         this.animating = true;
         this.host.setSprite(this.host.icon.replace(".png","-magic.png"),19);
         this._animator.playChain(animations,() => {
            this.animating = false;
            cb && cb();
         });
      }
      interpolateTick(elapsed:number) {
         super.interpolateTick(elapsed);

         if(!this.animating) {

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
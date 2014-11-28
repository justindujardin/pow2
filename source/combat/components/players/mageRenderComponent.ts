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

/// <reference path="../playerCombatRenderComponent.ts" />

module pow2.combat {
   export class MageCombatRenderComponent extends PlayerCombatRenderComponent {
      getAttackAnimation(strikeCb:()=>any){
         return [
            {
               name : "Prep Animation",
               callback: () => {
                  this.host.setSprite(this.host.icon.replace(".png","-magic.png"),19);
               }
            },
            {
               name : "Magic cast",
               repeats: 0,
               duration:1000,
               frames : [19,18,17,16,15],
               callback: () => {
                  strikeCb && strikeCb();
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
      }
   }
}
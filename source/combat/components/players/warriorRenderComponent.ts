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
   export class WarriorCombatRenderComponent extends PlayerCombatRenderComponent {
      getAttackAnimation(strikeCb:()=>any){
         return [
            {
               name: "Move Forward for Attack",
               repeats: 0,
               duration: 250,
               frames: [9, 11, 10],
               move: new Point(-1, 0),
               callback: () => {
                  this.host.setSprite(this.host.icon.replace(".png", "-attack.png"), 12);
               }
            },
            {
               name: "Strike at Opponent",
               repeats: 1,
               duration: 100,
               frames: [12, 13, 14, 15, 14, 13, 12],
               callback: () => {
                  this.host.setSprite(this.host.icon.replace("-attack.png", ".png"), 10);
                  strikeCb && strikeCb();
               }
            },
            {
               name: "Return to Party",
               duration: 250,
               repeats: 0,
               frames: [10, 11, 9],
               move: new Point(1, 0)
            }
         ];
      }
  }
}
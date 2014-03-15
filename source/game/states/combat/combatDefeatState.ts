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

/// <reference path="../gameCombatState.ts" />
/// <reference path="../../../../lib/pow2.d.ts" />

module pow2 {

   export class CombatDefeatState extends CombatState {
      static NAME:string = "Combat Defeat";
      name:string = CombatDefeatState.NAME;
      enter(machine:CombatStateMachine){
         super.enter(machine);
         console.log("SORRY BRO, YOU LOSE.");
         // callback(winner,loser);
         machine.trigger("combat:defeat",machine.enemies,machine.party);
      }
      update(machine:CombatStateMachine){
         if(machine.paused){
            return;
         }
         machine.parent.setCurrentState(GameMapState.NAME);
      }
   }

}
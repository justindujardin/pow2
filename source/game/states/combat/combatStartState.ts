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
/// <reference path="../../../core/state.ts" />

module pow2 {

   // Combat Begin
   //--------------------------------------------------------------------------
   export class CombatStartState extends CombatState {
      static NAME:string = "Combat Started";
      name:string = CombatStartState.NAME;
      transitions:IStateTransition[] = [
         new CombatBeginTurnTransition()
      ];

      enter(machine:CombatStateMachine){
         super.enter(machine);
         machine.current = machine.party[0];
         machine.currentDone = true;
      }
   }

   // Combat Transitions
   //--------------------------------------------------------------------------
   export class CombatCompletedTransition extends StateTransition {
      targetState:string = "";
      evaluate(machine:CombatStateMachine):boolean {
         if(!super.evaluate(machine)){
            return false;
         }
         var friendHP:number = machine.party[0].model.get('hp');
         var enemyHP:number = machine.enemies[0].model.get('hp');
         if(friendHP <= 0){
            this.targetState = CombatDefeatState.NAME;
            return true;
         }
         if(enemyHP <= 0){
            this.targetState = CombatVictoryState.NAME;
            return true;
         }
         return false;
      }
   }
}
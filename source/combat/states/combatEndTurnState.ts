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

/// <reference path="../../game/states/gameCombatState.ts" />
/// <reference path="../../../lib/pow2.d.ts" />

module pow2 {

   export class CombatEndTurnState extends CombatState {
      static NAME:string = "Combat End Turn";
      name:string = CombatEndTurnState.NAME;
      transitions:IStateTransition[] = [
         new CombatCompletedTransition(),
         new CombatStartTransition(),
         new CombatBeginTurnTransition()
      ];

      enter(machine:CombatStateMachine){
         super.enter(machine);
         machine.current = null;
         // Find the next turn.
         while(machine.turnList.length > 0 && !machine.current){
            machine.current = machine.turnList.shift();
            // Strip out defeated players.
            if(machine.current && machine.current.isDefeated()){
               machine.current = null;
            }
         }
         machine.update(this);
      }
   }


   // Combat Transitions
   //--------------------------------------------------------------------------

   export class CombatEndTurnTransition extends StateTransition {
      targetState:string = CombatEndTurnState.NAME;
      evaluate(machine:CombatStateMachine):boolean {
         return super.evaluate(machine) && machine.currentDone === true;
      }
   }
}
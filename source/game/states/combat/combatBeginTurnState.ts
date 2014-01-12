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
   export class CombatBeginTurnState extends CombatState {
      static NAME:string = "Combat Begin Turn";
      name:string = CombatBeginTurnState.NAME;
      transitions:IStateTransition[] = [
         new CombatEndTurnTransition()
      ];
      enter(machine:CombatStateMachine){
         super.enter(machine);
         machine.currentDone = !machine.isFriendlyTurn();
         // If enemy turn, complete it here.
         if(machine.currentDone){
            var enemy:string = machine.enemy.model.get('name');
            var friendly:string = machine.friendly.model.get('name');
            var damage:number = machine.enemy.model.attack(machine.friendly.model);
            console.log(friendly + " was attacked by " + enemy + ", and took " + damage + " damage.");
            console.log(friendly + " has (" + machine.friendly.model.get('hp') + ") hit points left");
         }
      }
      keyPress(machine:CombatStateMachine,keyCode:KeyCode):boolean {
         switch(keyCode){
            case KeyCode.ENTER:
               var enemy:string = machine.enemy.model.get('name');
               var friendly:string = machine.friendly.model.get('name');
               var damage:number = machine.friendly.model.attack(machine.enemy.model);
               console.log(friendly + " attacked " + enemy + " for (" + damage + ") damage");
               console.log(enemy + " has (" + machine.enemy.model.get('hp') + ") hit points left");
               machine.currentDone = true;
               break;
            default:
               return super.keyPress(machine,keyCode);
         }
         return false;
      }
   }

   // Combat Transitions
   //--------------------------------------------------------------------------
   export class CombatBeginTurnTransition extends StateTransition {
      targetState:string = CombatBeginTurnState.NAME;
      evaluate(machine:CombatStateMachine):boolean {
         return machine.current !== null && machine.currentDone === true;
      }
   }

}
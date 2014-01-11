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


   export class CombatState extends State {
      enter(machine:CombatStateMachine){
         super.enter(machine);
         var keyListener = (<any>machine).keyListener = (e) => {
            if (e.keyCode == 32) {
               machine.completed = true;
               e.preventDefault();
               return false;
            }
            return true;
         };
         $(window).on('keypress',keyListener);
      }
      exit(machine:CombatStateMachine){
         $(window).off('keypress',(<any>machine).keyListener);
         super.exit(machine);
      }
   }

   // Combat Begin
   //--------------------------------------------------------------------------
   export class CombatStartState extends CombatState {
      static NAME:string = "Combat Started";
      name:string = CombatStartState.NAME;
      transitions:IStateTransition[] = [
         new CombatCompletedTransition()
      ];
//      enter(machine:GameStateMachine){}
//      exit(machine:GameStateMachine){}
//      update(machine:IStateMachine){}
   }

   // Combat Completion States
   //--------------------------------------------------------------------------
   export class CombatCompletedTransition extends StateTransition {
      targetState:string = CombatVictoryState.NAME;
      evaluate(machine:CombatStateMachine):boolean {
         if(machine.completed){
            return true;
         }
         // IF PLAYER OR NME DEAD RETURN TRUE
         return false;
      }
   }
   export class CombatVictoryState extends CombatState {
      static NAME:string = "Combat Victory";
      name:string = CombatVictoryState.NAME;
      enter(machine:CombatStateMachine){
         console.log("HOLY CRAP YOU WON");
         machine.parent.setCurrentState(GameMapState.NAME);
      }
   }
   export class CombatDefeatState extends CombatState {
      static NAME:string = "Combat Defeat";
      name:string = CombatDefeatState.NAME;
      enter(machine:CombatStateMachine){
         console.log("SORRY BRO, YOU LOSE.");
         machine.parent.setCurrentState(GameMapState.NAME);
      }
   }


   export class CombatStateMachine extends StateMachine {
      defaultState:string = CombatStartState.NAME;
      states:IState[] = [
         new CombatStartState(),
         new CombatVictoryState(),
         new CombatDefeatState()
      ];
      completed:boolean = false;
      parent:GameStateMachine;
      constructor(parent:GameStateMachine){
         super();
         this.parent = parent;
      }
   }
}
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
   // Combat State Machine
   //--------------------------------------------------------------------------
   export class CombatStateMachine extends StateMachine {
      parent:GameStateMachine;
      defaultState:string = CombatStartState.NAME;
      states:IState[] = [
         new CombatStartState(),
         new CombatVictoryState(),
         new CombatDefeatState(),
         new CombatBeginTurnState(),
         new CombatEndTurnState()
      ];
      friendly:TileObject;
      enemy:TileObject;
      current:TileObject;
      currentDone:boolean = false;

      completed:boolean = false;
      win:boolean = false;

      keyListener:any = null;
      constructor(parent:GameStateMachine){
         super();
         this.parent = parent;
      }
   }


   // Combat States
   //--------------------------------------------------------------------------
   export class CombatState extends State {
      enter(machine:CombatStateMachine){
         super.enter(machine);
         machine.keyListener = (e) => {
            if(this.keyPress(machine,e.keyCode) === false){
               e.preventDefault();
               return false;
            }
            return true;
         };
         $(window).on('keypress',machine.keyListener);
      }
      exit(machine:CombatStateMachine){
         $(window).off('keypress',machine.keyListener);
         super.exit(machine);
      }

      keyPress(machine:CombatStateMachine,keyCode:KeyCode):boolean {
         switch(keyCode){
            case KeyCode.SPACE:
               machine.completed = true;
               machine.win = true;
               break;
            case KeyCode.ENTER:
               machine.completed = true;
               break;
            default:
               return true;
         }
         return false;
      }
   }

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
         machine.current = machine.friendly;
         machine.currentDone = true;
      }
   }

   export class CombatBeginTurnState extends CombatState {
      static NAME:string = "Combat Begin Turn";
      name:string = CombatBeginTurnState.NAME;
      transitions:IStateTransition[] = [
         new CombatEndTurnTransition()
      ];
      enter(machine:CombatStateMachine){
         super.enter(machine);
         console.log("Begin turn for " + machine.current.icon);
         machine.currentDone = false;
      }
      keyPress(machine:CombatStateMachine,keyCode:KeyCode):boolean {
         switch(keyCode){
            case KeyCode.ENTER:
               console.log("ATTACKED!!!");
               machine.currentDone = true;
               break;
            default:
               return super.keyPress(machine,keyCode);
         }
         return false;
      }
   }

   export class CombatEndTurnState extends CombatState {
      static NAME:string = "Combat End Turn";
      name:string = CombatEndTurnState.NAME;
      transitions:IStateTransition[] = [
         new CombatCompletedTransition(),
         new CombatBeginTurnTransition()
      ];

      enter(machine:CombatStateMachine){
         super.enter(machine);
         console.log("End turn for " + machine.current.icon);
         machine.current = machine.current.id === machine.friendly.id ? machine.enemy : machine.friendly;
      }
   }

   export class CombatVictoryState extends CombatState {
      static NAME:string = "Combat Victory";
      name:string = CombatVictoryState.NAME;
      enter(machine:CombatStateMachine){
         super.enter(machine);
         console.log("HOLY CRAP YOU WON");
         machine.parent.setCurrentState(GameMapState.NAME);
      }
   }
   export class CombatDefeatState extends CombatState {
      static NAME:string = "Combat Defeat";
      name:string = CombatDefeatState.NAME;
      enter(machine:CombatStateMachine){
         super.enter(machine);
         console.log("SORRY BRO, YOU LOSE.");
         machine.parent.setCurrentState(GameMapState.NAME);
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

   export class CombatEndTurnTransition extends StateTransition {
      targetState:string = CombatEndTurnState.NAME;
      evaluate(machine:CombatStateMachine):boolean {
         return machine.currentDone === true;
      }
   }
   export class CombatCompletedTransition extends StateTransition {
      targetState:string = "";
      evaluate(machine:CombatStateMachine):boolean {
         if(machine.completed){
            this.targetState = machine.win ? CombatVictoryState.NAME : CombatDefeatState.NAME;
            return true;
         }
         // IF PLAYER OR NME DEAD RETURN TRUE
         return false;
      }
   }
}
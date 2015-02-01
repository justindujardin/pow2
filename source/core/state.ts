/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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

/// <reference path="./stateMachine.ts" />
module pow2 {

   // State Interfaces
   // -------------------------------------------------------------------------
   export interface IState {
      name:string;
      enter(machine:IStateMachine);
      exit(machine:IStateMachine);
      update(machine:IStateMachine);
   }
   export interface IStateTransition {
      targetState:string;
      evaluate(machine:IStateMachine):boolean;
   }


   // Implementation
   // -------------------------------------------------------------------------
   export class State implements IState {
      name:string;
      transitions:IStateTransition[] = [];
      enter(machine:IStateMachine){}
      exit(machine:IStateMachine){}
      update(machine:IStateMachine){
         var l:number = this.transitions.length;
         for(var i:number = 0; i < l; i++){
            var t:IStateTransition = this.transitions[i];
            if(!t.evaluate(machine)){
               continue;
            }
            if(!machine.setCurrentState(t.targetState)){
               continue;
            }
            return;
         }
      }
   }

   export class StateTransition implements IStateTransition {
      targetState:string;
      evaluate(machine:IStateMachine):boolean {
         return true;
      }
   }
}
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

/// <reference path="../../types/underscore/underscore.d.ts" />
/// <reference path="./state.ts" />
module pow2 {

   // State Machine Interfaces
   // -------------------------------------------------------------------------
   export interface IStateMachine {
      tick();
      addState(name:string,state:IState);
      getCurrentState():IState;
      getCurrentName():string;
      setCurrentState(name:string):boolean;
      getPreviousState():IState;
      getState(name:string):IState;
   }

   // Implementation
   // -------------------------------------------------------------------------
   export class StateMachine implements IStateMachine {
      defaultState:string = null;
      private _states = {};
      private _currentState:IState = null;
      private _previousState:IState = null;
      private _newState:boolean = false;

      tick(){
         this._newState = false;
         if(this._currentState === null){
            this.setCurrentState(this.defaultState);
         }
         if(this._currentState !== null){
            this._currentState.tick(this);
         }
         // Didn't transition, make sure previous === current for next tick.
         if(this._newState === false && this._currentState !== null){
            this._previousState = this._currentState;
         }
      }
      addState(name:string,state:IState){
         this._states[name] = state;
      }
      getCurrentState():IState{
         return this._currentState;
      }
      getCurrentName():string{
         return this._currentState !== null ? this._currentState.name : null;
      }
      setCurrentState(name:string):boolean{
         var newState:IState = this.getState(name);
         var oldState:IState = this._currentState;
         if(newState === null){
            return false;
         }
         this._newState = true;
         this._previousState = this._currentState;
         this._currentState = newState;
         if(oldState){
            oldState.exit(this);
         }
         newState.enter(this);
         return true;
      }
      getPreviousState():IState{
         return this._previousState;
      }
      getState(name:string):IState{
         return typeof this._states[name] !== 'undefined' ? this._states[name] : null;
      }
   }
}
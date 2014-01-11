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
/// <reference path="./world.ts" />
module pow2 {

   // State Machine Interfaces
   // -------------------------------------------------------------------------
   export interface IStateMachine {
      update(data:any);
      addState(state:IState);
      getCurrentState():IState;
      getCurrentName():string;
      setCurrentState(name:string):boolean;
      setCurrentState(state:IState):boolean;
      setCurrentState(newState:any):boolean;
      getPreviousState():IState;
      getState(name:string):IState;
   }

   // Implementation
   // -------------------------------------------------------------------------
   export class StateMachine implements IStateMachine, IWorldObject {
      defaultState:string = null;
      states:any = {};
      private _currentState:IState = null;
      private _previousState:IState = null;
      private _newState:boolean = false;

      // IWorldObject interface
      world:IWorld;
      onAddToWorld(world){
         world.time.addObject(this);
      }
      onRemoveFromWorld(world){
         world.time.removeObject(this);
      }

      tick(elapsed:number){
         this.update(data);
      }

      update(data:any){
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
      addState(state:IState){
         this.states.push(state);
      }
      getCurrentState():IState{
         return this._currentState;
      }
      getCurrentName():string{
         return this._currentState !== null ? this._currentState.name : null;
      }
      setCurrentState(state:IState):boolean;
      setCurrentState(state:string):boolean
      setCurrentState(newState:any):boolean{
         if(typeof newState === 'string'){
            newState = this.getState(newState);
         }
         else {
            newState = <IState>newState;
         }
         var oldState:IState = this._currentState;
         if(!newState){
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
         return <IState>_.where(this.states,{name:name})[0];
      }
   }
}
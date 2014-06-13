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
/// <reference path="./events.ts" />
module pow2 {

   // State Machine Interfaces
   // -------------------------------------------------------------------------
   export interface IStateMachine extends IEvents {
      paused:boolean;
      update(data:any);
      addState(state:IState);
      addStates(states:IState[]);
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
   export class StateMachine extends Events implements IStateMachine {
      defaultState:string = null;
      states:IState[] = [];
      private _currentState:IState = null;
      private _previousState:IState = null;
      private _newState:boolean = false;
      paused:boolean = false;

      update(data:any){
         this._newState = false;
         if(this._currentState === null){
            this.setCurrentState(this.defaultState);
         }
         if(this._currentState !== null){
            this._currentState.update(this);
         }
         // Didn't transition, make sure previous === current for next tick.
         if(this._newState === false && this._currentState !== null){
            this._previousState = this._currentState;
         }
      }
      addState(state:IState){
         this.states.push(state);
      }
      addStates(states:IState[]){
         this.states = _.unique(this.states.concat(states));
      }

      getCurrentState():IState{
         return this._currentState;
      }
      getCurrentName():string{
         return this._currentState !== null ? this._currentState.name : null;
      }
      setCurrentState(state:IState):boolean;
      setCurrentState(state:string):boolean;
      setCurrentState(newState:any):boolean{
         var state = typeof newState === 'string' ? this.getState(newState) : <IState>newState;
         var oldState:IState = this._currentState;
         if(!state){
            console.error("STATE NOT FOUND: " + newState);
            return false;
         }
         this._newState = true;
         this._previousState = this._currentState;
         this._currentState = state;
         if(oldState){
            this.trigger("exit",oldState,state);
            oldState.exit(this);
         }
         state.enter(this);
         this.trigger("enter",state,oldState);
         return true;
      }
      getPreviousState():IState{
         return this._previousState;
      }
      getState(name:string):IState{
         var state = _.find(this.states,(s:IState) => {
            return s.name === name;
         });
         return state;
      }
   }

   /**
    * A state machine that updates with every game tick.
    */
   export class TickedStateMachine extends StateMachine implements IWorldObject {
      // IWorldObject interface
      world:IWorld;
      onAddToWorld(world){
         world.time.addObject(this);
      }
      onRemoveFromWorld(world){
         world.time.removeObject(this);
      }
      tick(elapsed:number){
         this.update(elapsed);
      }
   }

}
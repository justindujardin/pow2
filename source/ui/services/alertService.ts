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
/// <reference path="../../../types/angularjs/angular.d.ts"/>
/// <reference path="../../../source/game/gameWorld.ts"/>
/// <reference path="./gameService.ts"/>

module pow2.ui {

   export interface IPowAlertObject {
      message:string;
      duration?:number;
      enter?(done:() => void);
      entered?(done:() => void);
      exit?(done:() => void);
      exited?(done:() => void);
   }

   export interface IAlertScopeService extends ng.IRootScopeService {
      powAlert:IPowAlertObject;
   }

   /**
    * Provide a basic service for queuing and showing messages to the user.
    */
   export class PowAlertService extends pow2.Events implements pow2.IWorldObject, pow2.IProcessObject {
      scope:IAlertScopeService;
      timeout:ng.ITimeoutService;
      game:PowGameService;
      world:pow2.GameWorld;
      id:number = _.uniqueId();

      private _current:IPowAlertObject = null;
      private _queue:IPowAlertObject[] = [];
      constructor(scope:IAlertScopeService,timeout:ng.ITimeoutService,game:PowGameService){
         super();
         _.bindAll(this,"_defaultEnter","_defaultEntered","_defaultExit","_defaultExited");
         this.scope = scope;
         this.timeout = timeout;
         this.game = game;

         game.world.mark(this);
         game.world.time.addObject(this);
      }

      destroy() {
         this.game.world.time.removeObject(this);
         this.game.world.erase(this);
      }

      show(message:string){
         this._queue.push({
            message:message,
            duration: 1000
         });
      }

      /*
       * Update current message, and manage event generation for transitions
       * between messages.
       * @param elapsed number The elapsed time since the last invocation, in milliseconds.
       */
      processFrame(elapsed:number) {
         if(this._current || this._queue.length === 0){
            return;
         }
         this._current = this._queue.shift();
         this.scope.$apply(() => {
            this.scope.powAlert = this._current;

            var steps = [
               (this._current.enter   || this._defaultEnter),
               (this._current.entered || this._defaultEntered),
               (this._current.exit    || this._defaultExit),
               (this._current.exited  || this._defaultExited)
            ];
            var nextStep = () => {
               var currentStep:Function = steps.shift();
               if(!currentStep){
                  this.scope.$apply(() => {
                     this.scope.powAlert = this._current = null;
                  });
               }
               else {
                  currentStep(nextStep);
               }
            };
            nextStep();

         });
      }

      private _defaultEnter(done:() => void){
         done();
      }
      private _defaultEntered(done:() => void){
         var delay:number = this._current.duration;
         this.timeout(done,delay);
      }
      private _defaultExit(done:() => void){
         done();
      }
      private _defaultExited(done:() => void){
         done();
      }

   }
   app.factory('powAlert', ['$rootScope','$timeout','game',($rootScope,$timeout,game) => {
      return new PowAlertService($rootScope,$timeout,game);
   }]);
}
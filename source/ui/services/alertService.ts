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
   }

   /**
    * Provide a basic service for queuing and showing messages to the user.
    *
    * Clicking/Tapping will either:
    *  - Dismiss a message if it is fully displayed and waiting to timeout
    *  - Fully display a message if it is during an enter animation.
    */
   export class PowAlertService extends pow2.Events implements pow2.IWorldObject, pow2.IProcessObject {
      scope:ng.IRootScopeService;
      timeout:ng.ITimeoutService;
      game:PowGameService;
      world:pow2.GameWorld;
      id:number = _.uniqueId();

      private _current:IPowAlertObject = null;
      private _queue:IPowAlertObject[] = [];
      constructor(scope:ng.IRootScopeService,timeout:ng.ITimeoutService,game:PowGameService){
         super();
         this.scope = scope;
         this.timeout = timeout;
         this.game = game;

         game.world.mark(this);
         //game.world.time.addObject(this);
      }

      destroy() {
         this.game.world.time.removeObject(this);
         this.game.world.erase(this);
      }

      /**
       * Update current message, and manage event generation for transitions
       * between messages.
       * @param elapsed number The elapsed time since the last invocation, in milliseconds.
       */
      processFrame(elapsed:number) {
         if(!this._current && this._queue.length === 0){
            return;
         }

      }


      show(message:string){
         this._queue.push({
            message:message,
            duration: 1000
         });
      }
   }
   app.factory('powAlert', ['$rootScope','$timeout','game',($rootScope,$timeout,game) => {
      return new PowAlertService($rootScope,$timeout,game);
   }]);
}
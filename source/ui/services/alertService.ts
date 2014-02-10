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
      done?(message:IPowAlertObject);
   }

   export interface IAlertScopeService extends ng.IRootScopeService {
      powAlert:IPowAlertObject;
   }

   export interface IPowAlertService {
      show(message:string):IPowAlertObject;
      queue(config:IPowAlertObject);
   }

   /**
    * Provide a basic service for queuing and showing messages to the user.
    */
   export class PowAlertService extends pow2.Events implements pow2.IWorldObject, pow2.IProcessObject, IPowAlertService {
      scope:IAlertScopeService;
      timeout:ng.ITimeoutService;
      game:PowGameService;
      world:pow2.GameWorld;
      element:ng.IAugmentedJQuery;
      container:ng.IAugmentedJQuery;
      animate:any;
      id:number = _.uniqueId();

      private _current:IPowAlertObject = null;
      private _queue:IPowAlertObject[] = [];
      constructor(element,container,scope:IAlertScopeService,timeout:ng.ITimeoutService,game:PowGameService,animate:any){
         super();
         this.scope = scope;
         this.timeout = timeout;
         this.game = game;
         this.element = element;
         this.container = container;
         this.animate = animate;

         game.world.mark(this);
         game.world.time.addObject(this);
      }

      destroy() {
         this.game.world.time.removeObject(this);
         this.game.world.erase(this);
      }

      show(message:string,done?:() => void,duration?:number):IPowAlertObject{
         var obj:IPowAlertObject = {
            message:message,
            duration: typeof duration === 'undefined' ? 1000 : duration,
            done:done
         };
         this._queue.push(obj);
         return obj;
      }

      queue(config:IPowAlertObject){
         this._queue.push(config);
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
            this.animate.enter(this.element, this.container, null,() => {
               this.timeout(() => {
                  this.animate.leave(this.element, () => {
                     this._current.done && this._current.done(this._current);
                     this.scope.powAlert = this._current = null;
                  });
               },this._current.duration);
            });
         });
      }
   }
   app.factory('powAlert', [
      '$rootScope',
      '$timeout',
      'game',
      '$compile',
      '$document',
      '$animate',
      ($rootScope,$timeout,game,$compile,$document,$animate) => {
         var alertElement = $compile('<div class="drop-overlay fade"><div class="ebp">{{powAlert.message}}</div></div>')($rootScope);
         return new PowAlertService(alertElement,$document.find('body'),$rootScope,$timeout,game,$animate);
      }
   ]);
}
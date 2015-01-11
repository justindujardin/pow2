/*
 Copyright (C) 2013-2014 by Justin DuJardin and Contributors

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

/// <reference path="../index.ts"/>
/// <reference path="../states/dorkaponMapState.ts"/>
/// <reference path="../dorkaponGameWorld.ts"/>

module dorkapon.services {
   export class DorkaponService {
      loader:pow2.ResourceLoader;
      world:DorkaponGameWorld;
      machine:DorkaponAppStateMachine;
      constructor(
         public compile:ng.ICompileService,
         public scope:ng.IRootScopeService){
         this.loader = pow2.ResourceLoader.get();
         this.world = new DorkaponGameWorld({
            scene:new pow2.Scene({
               autoStart: true,
               debugRender:false
            }),
            model:new pow2.GameStateModel()
         });
         pow2.registerWorld(dorkapon.NAME,this.world);

         this.machine = new DorkaponAppStateMachine();

         // Tell the world time manager to start ticking.
         this.world.time.start();
      }

      /**
       * Start a new game.
       * @param then
       */
      newGame(then?:()=>any){
         this.machine.setCurrentState(dorkapon.states.AppMapState.NAME);
         then && then();
      }
   }
   app.factory('$dorkapon', [
      '$compile',
      '$rootScope',
      ($compile:ng.ICompileService,$rootScope:ng.IRootScopeService) => {
         return new DorkaponService($compile,$rootScope);
      }
   ]);
}
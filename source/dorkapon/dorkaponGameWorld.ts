/*
 Copyright (C) 2013-2014 by Justin DuJardin

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

/// <reference path="../../lib/pow2.d.ts" />
/// <reference path="./dorkaponMapStateMachine.ts" />

module dorkapon {
   export class DorkaponGameWorld extends pow2.SceneWorld {
      /**
       * The current map state machine.
       */
      mapState:DorkaponMapStateMachine;
      /**
       * The current combat state (if any).  The presence of this
       * state machine being valid may trigger the game UI to transition
       * to combat.
       *
       * This variable should be set to null when no combat is taking place.
       */
      combatState:states.DorkaponCombatStateMachine = null;

      model:pow2.GameStateModel;
      scene:pow2.Scene;

      tables:pow2.GameDataResource;

      constructor(services?:any){
         super(services);
         //pow2.GameDataResource.clearCache();
         this.loader.registerType('powEntities',pow2.EntityContainerResource);
         this.tables = <pow2.GameDataResource>this.loader.loadAsType(dorkapon.SPREADSHEET_ID,pow2.GameDataResource);
      }


      /**
       * Get the game data sheets from google and callback when they're loaded.
       * @param then The function to call when spreadsheet data has been fetched
       */
      static getDataSource(then?:(data:pow2.GameDataResource)=>any):pow2.GameDataResource {
         var world = <DorkaponGameWorld>pow2.getWorld(dorkapon.NAME);
         if(world.tables.isReady()){
            then(world.tables);
         }
         else {
            world.tables.once(pow2.Resource.READY,()=>{
               then(world.tables);
            });
         }
         return world.tables;
      }

   }
}
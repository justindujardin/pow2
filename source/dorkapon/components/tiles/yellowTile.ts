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

/// <reference path="../mapNodeComponent.ts" />
/// <reference path="../../states/dorkaponCombatState.ts" />

module dorkapon.components.tiles {
   export class YellowTile extends MapNodeComponent {

      machine: dorkapon.DorkaponCombatStateMachine = null;

      /**
       * Roll and present a random encounter with a bad guy.
       */
      doAction(object:objects.DorkaponEntity,then:()=>any){

         //object.scene.paused = true;
         this.world.combatState = new dorkapon.DorkaponCombatStateMachine(object,object);
         this.world.combatState.on(pow2.StateMachine.Events.ENTER,(newState:pow2.IState)=>{
            if(newState.name === states.DorkaponCombatEnded.NAME){
               _.defer(then);
            }
         });
         this.world.combatState.setCurrentState(dorkapon.states.DorkaponCombatInit.NAME);
         console.log("RANDOM ENCOUNTER LIKE WHOA");
      }

      enter(object:objects.DorkaponEntity):boolean {
         super.enter(object);
         console.log("YELLOW NODE");
         return true;
      }
   }
}
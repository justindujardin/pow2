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

/// <reference path="../playerComponent.ts" />
/// <reference path="../gameFeatureComponent.ts" />

module pow2 {
   export class CombatFeatureComponent extends GameFeatureComponent {
      party:PlayerComponent;
      enter(object:GameFeatureObject):boolean {
         this.party = <PlayerComponent>object.findComponent(PlayerComponent);
         // Create new combat state
         // set current state on game machine manually here.
//         var coll = <CollisionComponent>machine.player.findComponent(CollisionComponent);
//         if(coll){
//            var results = [];
//            if(coll.collide(machine.player.point.x,machine.player.point.y,GameFeatureObject,results)){
//               var touched = <GameFeatureObject>_.find(results,(r:GameFeatureObject) => {
//                  return !!r.findComponent(CombatFeatureComponent);
//               });
//               if(touched){
//                  var combat = <CombatFeatureComponent>touched.findComponent(CombatFeatureComponent);
//                  if(combat.isEntered){
//                     machine.combatType = pow2.COMBAT_ENCOUNTERS.FIXED;
//                     machine.combatant = touched;
//                     return true;
//                  }
//               }
//            }
//         }
//
         return !!this.party;
      }
      exited(object:GameFeatureObject):boolean {
         this.setDataHidden(true);
         return super.exited(object);
      }
   }
}
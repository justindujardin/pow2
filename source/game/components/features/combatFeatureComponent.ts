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
         if(!this.party){
            return false;
         }
         var zone:IZoneMatch = this.host.tileMap.getCombatZones(this.party.host.point);
         this.host.world.fixedEncounter(zone,this.host.id);
         this.setDataHidden(true);
         return true;
      }
      exited(object:GameFeatureObject):boolean {
         return super.exited(object);
      }
   }
}
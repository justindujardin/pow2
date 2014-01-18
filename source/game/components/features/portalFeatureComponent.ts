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

/// <reference path="../../../core/point.ts" />
/// <reference path="../../../tile/tileComponent.ts" />
/// <reference path="../gameFeatureComponent.ts" />
/// <reference path="../combatEncounterComponent.ts" />
module pow2 {
   export class PortalFeatureComponent extends GameFeatureComponent {
      map:string;
      target:Point;
      syncComponent():boolean{
         if(!super.syncComponent()){
            return false;
         }
         this.map = this.feature.target;
         this.target = new Point(this.feature.targetX,this.feature.targetY);
         return !!this.map;
      }
      entered(object:TileObject):boolean {
         if(!this.target || !this.tileMap){
            return false;
         }
         object.scene.once("map:loaded",(map) => {
            console.log("Transition to: " + this.map);
            object.setPoint(this.target);
            if(map.map && map.map.properties && map.map.properties.combat === true){
               object.addComponent(new CombatEncounterComponent());
               // Add encounter component
            }
            else {
               object.removeComponentByType(CombatEncounterComponent);
               // remove encounter component
            }
         });
         this.tileMap.load(this.map);
         return true;
      }

   }

}
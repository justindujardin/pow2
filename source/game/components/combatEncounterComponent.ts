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

/// <reference path="../../tile/tileComponent.ts" />
/// <reference path="../objects/gameEntityObject.ts" />

module pow2 {

   /**
    * A component that defines the functionality of a map feature.
    */
   export class CombatEncounterComponent extends TileComponent {
      host:GameEntityObject;
      battleCounter:number = 256;
      combatFlag:boolean = false;

      connectComponent():boolean {
         if(!super.connectComponent()){
            return false;
         }
         this.host.on('move:begin',this.moveProcess,this);
         this.resetBattleCounter();
         return true;
      }
      disconnectComponent():boolean {
         this.host.off('move:begin',this.moveProcess);
         return super.disconnectComponent();
      }
      moveProcess() {
         if(this.battleCounter <= 0){
            this.host.trigger('combat:encounter',this);
            this.combatFlag = true;
         }
         this.battleCounter -= 6; // TODO: Variance based on tile type
         return false;
      }
      resetBattleCounter() {
         var max:number = 255;
         var min:number = 64;
         this.battleCounter = Math.floor(Math.random() * (max - min + 1)) + min;
         this.combatFlag = false;
      }
   }
}
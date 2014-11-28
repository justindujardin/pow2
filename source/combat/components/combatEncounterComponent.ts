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

/// <reference path="../../game/objects/gameEntityObject.ts" />

module pow2 {

   /**
    * A component that defines the functionality of a map feature.
    */
   export class CombatEncounterComponent extends SceneComponent {
      host:GameTileMap;
      battleCounter:number;
      combatFlag:boolean = false;
      combatZone:string = 'default';
      isDangerous:boolean = false;
      world:GameWorld = pow2.getWorld<GameWorld>('pow2');

      connectComponent():boolean {
         if(!super.connectComponent() || !(this.host instanceof GameTileMap)){
            return false;
         }
         this.battleCounter = this.world.model.getKeyData('battleCounter');
         if(typeof this.battleCounter === 'undefined'){
            this.resetBattleCounter();
         }
         return true;
      }
      disconnectComponent():boolean {
         if(this.player){
            this.player.off(null,null,this);
         }
         this.player = null;
         return super.disconnectComponent();
      }

      player:GameEntityObject = null;
      syncComponent():boolean{
         super.syncComponent();
         if(this.player){
            this.player.off(null,null,this);
         }
         this.player = <GameEntityObject>this.scene.objectByComponent(PlayerComponent);
         if(this.player){
            this.player.on('move:begin',this.moveProcess,this);
         }
         return !!this.player;
      }

      moveProcess(player:PlayerComponent,from:Point,to:Point) {
         var terrain = this.host.getTerrain("Terrain",to.x,to.y);
         this.isDangerous = terrain && terrain.isDangerous;
         var dangerValue = this.isDangerous ? 10 : 6;
         if(this.battleCounter <= 0){
            this.triggerCombat(to);
         }
         this._setCounter(this.battleCounter - dangerValue);
         return false;
      }
      resetBattleCounter() {
         var max:number = 255;
         var min:number = 64;
         this._setCounter(Math.floor(Math.random() * (max - min + 1)) + min);
         this.combatFlag = false;
      }

      triggerCombat(at:pow2.Point) {
         var zones:IZoneMatch = this.host.getCombatZones(at);
         this.combatZone = zones.map || zones.target;
         console.log("Combat in zone : " + this.combatZone);
         this.host.world.randomEncounter(zones);
         this.host.trigger('combat:encounter',this);
         this.resetBattleCounter();
         this.combatFlag = true;
      }

      private _setCounter(value:number){
         this.battleCounter = value;
         this.world.model.setKeyData('battleCounter',this.battleCounter);
      }
   }
}
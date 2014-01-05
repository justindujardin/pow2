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
/// <reference path="../../../tile/tileObject.ts" />
/// <reference path=".././gamePartyComponent.ts" />
/// <reference path="../../gameComponent.ts" />

module pow2 {
   export class ShipFeatureComponent extends GameComponent {
      party:GamePartyComponent;
      partyObject:TileObject;
      partySprite:string;
      enter(object:GameFeatureObject):boolean {
         if(!this.tileMap){
            return false;
         }
         // Must have a party component to board a ship.  Don't want buildings
         // and NPCs boarding ships... or do we?  [maniacal laugh]
         this.party = <GamePartyComponent>object.findComponent(GamePartyComponent);
         if(!this.party){
            return false;
         }
         this.party.passableKeys = ['shipPassable','passable'];
         return true;
      }
      entered(object:GameFeatureObject):boolean {
         return this.board(object);
      }

      /**
       * Board an object onto the ship component.  This will modify the
       * @param object
       */
      board(object:GameFeatureObject):boolean{
         if(this.partyObject || !this.party){
            return false;
         }
         this.partyObject = object;
         this.partySprite = object.setSprite(this.host.icon);
         this.host.visible = false;
         this.host.enabled = false;
         // If we're moving from shipPassable to passable, disembark the ship.
         this.party.setMoveFilter((from:Point,to:Point) => {
            var fromTerrain = this.tileMap.getTerrain(from.x,from.y);
            var toTerrain = this.tileMap.getTerrain(to.x,to.y);
            if(!fromTerrain || !toTerrain){
               return;
            }
            if(fromTerrain.shipPassable && toTerrain.passable){
               this.disembark(from);
            }
         });
         return true;
      }

      disembark(at?:Point){
         this.partyObject.setSprite(this.partySprite);
         this.party.clearMoveFilter();
         this.party.passableKeys = ['passable'];
         this.host.point.set(at || this.partyObject.point);
         this.host.visible = true;
         this.host.enabled = true;
         this.partyObject = null;
         this.party = null;
      }
   }
}
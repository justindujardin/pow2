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

/// <reference path="../../scene/components/movableComponent.ts" />
/// <reference path="../objects/gameFeatureObject.ts" />
/// <reference path="../../tile/tileComponent.ts" />

module pow2 {
   export class GamePartyComponent extends MovableComponent {
      host:TileObject;
      passableKeys:string[] = ['passable'];
      collideMove(x:number, y:number,results=[]) {
         var collision:boolean = super.collideMove(x,y,results);
         if(collision){
            for (var i = 0; i < results.length; i++) {
               var o:TileFeatureObject = results[i];
               var comp:TileComponent = <TileComponent>o.findComponent(TileComponent);
               if(!comp){
                  continue;
               }
               console.log("Collide -> " + o.type);
               if (comp.enter && comp.enter(this.host) === false) {
                  return true;
               }
            }
         }
         var map = this.host.scene.objectByType(pow2.TileMap);
         if (map) {
            var terrain = map.getTerrain(x,y);
            if (!terrain) {
               return true;
            }
            for(var i = 0; i < this.passableKeys.length; i++){
               if(terrain[this.passableKeys[i]] === true){
                  return false;
               }
            }
            return true;
         }
         return false;
      }
      endMove(from:Point,to:Point) {
         if(!this.collider){
            return;
         }

         // Successful move, collide against target point and check any new tile actions.
         var fromFeature:TileFeatureObject = <TileFeatureObject>this.collider.collideFirst(from.x,from.y,TileFeatureObject);
         if (fromFeature) {
            var comp = <TileComponent>fromFeature.findComponent(TileComponent);
            if(comp){
               comp.exited(this.host);
            }
         }

         // Successful move, collide against target point and check any new tile actions.
         var toFeature:TileFeatureObject = <TileFeatureObject>this.collider.collideFirst(to.x,to.y,TileFeatureObject);
         if (toFeature) {
            var comp = <TileComponent>toFeature.findComponent(TileComponent);
            if(comp){
               comp.entered(this.host);
            }
         }

      }
   }
}
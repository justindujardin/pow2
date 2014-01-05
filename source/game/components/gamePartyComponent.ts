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
      private _lastFrame:number = 3;
      private _renderFrame:number = 3;

      interpolateTick(elapsed:number) {
         super.interpolateTick(elapsed);

         // Choose frame for interpolated position
         // Hero is
         // Left, Right, Down, Up, LeftAlt, RightAlt, DownAlt, UpAlt
         //   1     2      3    4      5        6        7       8

         // Interpolate position based on tickrate and elapsed time
         var factor = this._elapsed / this.tickRateMS;
         var altFrame = !!((factor > 0.0 && factor < 0.5));
         var frame = this._renderFrame;
         var xChange = this.targetPoint.x !== this.host.renderPoint.x;
         var yChange = this.targetPoint.y !== this.host.renderPoint.y;
         if(this.velocity.x < 0 && xChange){
            frame = altFrame ? 4 : 0;
         }
         else if(this.velocity.x > 0 && xChange){
            frame = altFrame ? 5 : 1;
         }
         else if(this.velocity.y > 0 && yChange){
            frame = altFrame ? 6 : 2;
         }
         else if(this.velocity.y < 0 && yChange){
            frame = altFrame ? 7 : 3;
         }
         this.host.iconFrame = this._renderFrame = frame;
      }


      collideMove(x:number,y:number,results:GameFeatureObject[]=[]){
         var collision:boolean = this.collider.collide(x,y,GameFeatureObject,results);
         if(collision){
            for (var i = 0; i < results.length; i++) {
               var o = <GameFeatureObject>results[i];
               if(o.passable === true){
                  return false;
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
      beginMove(from:Point,to:Point) {
         var results = [];
         var collision:boolean = this.collider.collide(to.x,to.y,GameFeatureObject,results);
         if(collision){
            for (var i = 0; i < results.length; i++) {
               var o:GameFeatureObject = results[i];
               var comp:TileComponent = <TileComponent>o.findComponent(TileComponent);
               if(!comp || !comp.enter){
                  continue;
               }
               console.log("Collide -> " + o.type);
               if(comp.enter(this.host) === false){
                  return;
               }
            }
         }
      }
      endMove(from:Point,to:Point) {
         if(!this.collider){
            return;
         }
         this._lastFrame = this._renderFrame;

         // Successful move, collide against target point and check any new tile actions.
         var fromFeature:GameFeatureObject = <GameFeatureObject>this.collider.collideFirst(from.x,from.y,GameFeatureObject);
         if (fromFeature) {
            var comp = <TileComponent>fromFeature.findComponent(TileComponent);
            if(comp){
               comp.exited(this.host);
            }
         }

         // Successful move, collide against target point and check any new tile actions.
         var toFeature:GameFeatureObject = <GameFeatureObject>this.collider.collideFirst(to.x,to.y,GameFeatureObject);
         if (toFeature) {
            var comp = <TileComponent>toFeature.findComponent(TileComponent);
            if(comp){
               comp.entered(this.host);
            }
         }

      }
   }
}
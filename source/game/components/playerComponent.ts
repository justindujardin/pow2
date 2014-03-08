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

/// <reference path="../../../lib/pow2.d.ts" />
/// <reference path="../objects/gameFeatureObject.ts" />
/// <reference path="../../tile/tileComponent.ts" />
/// <reference path="./playerRenderComponent.ts" />

module pow2 {

   export class PlayerComponent extends MovableComponent {
      host:TileObject;
      passableKeys:string[] = ['passable'];
      collideTypes:string[] = ['temple','store','sign'];
      private _lastFrame:number = 3;
      private _renderFrame:number = 3;
      heading:Point = new Point(0,-1);
      sprite:PlayerRenderComponent = null;

      syncComponent():boolean {
         this.sprite = <PlayerRenderComponent>this.host.findComponent(PlayerRenderComponent);
         return super.syncComponent();
      }
      tick(elapsed:number){
         // There are four states and two rows.  The second row is all alt states, so mod it out
         // when a move ends.
         this._lastFrame = this._renderFrame > 3 ? this._renderFrame - 4 : this._renderFrame;
         super.tick(elapsed);
      }
      interpolateTick(elapsed:number) {
         super.interpolateTick(elapsed);
         if(!this.sprite){
            return;
         }
         var xMove = this.targetPoint.x !== this.host.renderPoint.x;
         var yMove = this.targetPoint.y !== this.host.renderPoint.y;
         if(this.velocity.y > 0 && yMove){
            this.sprite.setHeading(Headings.SOUTH,yMove);
            this.heading.set(0,1);
         }
         else if(this.velocity.y < 0 && yMove){
            this.sprite.setHeading(Headings.NORTH,yMove);
            this.heading.set(0,-1);
         }
         else if(this.velocity.x < 0 && xMove){
            this.sprite.setHeading(Headings.WEST,xMove);
            this.heading.set(-1,0);
         }
         else if(this.velocity.x > 0 && xMove){
            this.sprite.setHeading(Headings.EAST,xMove);
            this.heading.set(1,0);
         }
         else {
            if(this.velocity.y > 0){
               this.sprite.setHeading(Headings.SOUTH,false);
               this.heading.set(0,1);
            }
            else if(this.velocity.y < 0){
               this.sprite.setHeading(Headings.NORTH,false);
               this.heading.set(0,-1);
            }
            else if(this.velocity.x < 0){
               this.sprite.setHeading(Headings.WEST,false);
               this.heading.set(-1,0);
            }
            else if(this.velocity.x > 0){
               this.sprite.setHeading(Headings.EAST,false);
               this.heading.set(1,0);
            }
            else {
               this.sprite.setMoving(false);
            }
         }
      }


      collideMove(x:number,y:number,results:GameFeatureObject[]=[]){
         var collision:boolean = this.collider.collide(x,y,GameFeatureObject,results);
         if(collision){
            for (var i = 0; i < results.length; i++) {
               var o = <GameFeatureObject>results[i];
               if(o.passable === true || !o.type){
                  return false;
               }
               if(_.indexOf(this.collideTypes, o.type.toLowerCase()) !== -1){
                  return true;
               }
            }
         }
         var map:TileMap = <TileMap>this.host.scene.objectByType(TileMap);
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
         this.host.trigger('move:begin',this,from,to);

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

         this.host.trigger('move:end',this,from,to);

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
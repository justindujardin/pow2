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
/// <reference path="./playerRenderComponent.ts" />
/// <reference path="../objects/gameFeatureObject.ts" />

module pow2.game.components {

   export class PlayerComponent extends MovableComponent {
      host:TileObject;
      passableKeys:string[] = ['passable'];
      static COLLIDE_TYPES:string[] = ['pow2.TempleFeatureComponent','pow2.StoreFeatureComponent','pow2.DialogFeatureComponent','sign'];
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

      /**
       * Determine if a point on the map collides with a given terrain
       * attribute.  If the attribute is set to false, a collision occurs.
       *
       * @param at {pow2.Point} The point to check.
       * @param passableAttribute {string} The attribute to check.
       * @returns {boolean} True if the passable attribute was found and set to false.
       */
      collideWithMap(at:pow2.Point,passableAttribute:string):boolean{
         var map:TileMap = <TileMap>this.host.scene.objectByType(TileMap);
         if (map) {
            var layers:tiled.ITiledLayer[] = map.getLayers();
            for(var i = 0; i < layers.length; i++) {
               var terrain = map.getTileData(layers[i],at.x,at.y);
               if (!terrain) {
                  continue;
               }
               if(terrain[passableAttribute] === false){
                  return true;
               }
            }
         }
         return false;
      }

      collideMove(x:number,y:number,results:GameFeatureObject[]=[]){
         var collision:boolean = this.collider && this.collider.collide(x,y,GameFeatureObject,results);
         if(collision){
            for (var i = 0; i < results.length; i++) {
               var o = <GameFeatureObject>results[i];
               if(o.passable === true || !o.type){
                  return false;
               }
               if(_.indexOf(PlayerComponent.COLLIDE_TYPES, o.type) !== -1){
                  return true;
               }
            }
         }
         // Iterate over all layers of the map, check point(x,y) and see if the tile
         // has any unpassable attributes set on it.  If any unpassable attributes are
         // found, there is a collision.
         // TODO: This should probably respect layer visibility, and another flag?  collidable?
         var map:TileMap = <TileMap>this.host.scene.objectByType(TileMap);
         if (map) {
            var layers:tiled.ITiledLayer[] = map.getLayers();
            for(var i = 0; i < layers.length; i++) {
               var terrain = map.getTileData(layers[i],x,y);
               if (!terrain) {
                  continue;
               }
               for(var j = 0; j < this.passableKeys.length; j++){
                  if(terrain[this.passableKeys[j]] === false){
                     return true;
                  }
               }
            }
         }
         return false;
      }
      beginMove(from:Point,to:Point) {
         this.host.trigger('move:begin',this,from,to);

         var results = [];
         var collision:boolean = this.collider && this.collider.collide(to.x,to.y,GameFeatureObject,results);
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
         this.host.trigger('move:end',this,from,to);
         if(!this.collider){
            return;
         }

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
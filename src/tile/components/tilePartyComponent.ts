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

/// <reference path="../../core/point.ts" />
/// <reference path="../../core/rect.ts" />
/// <reference path="../../scene/sceneObject.ts" />
/// <reference path="../../scene/components/tickedComponent.ts" />
/// <reference path="../tileObject.ts" />
/// <reference path="../tileMap.ts" />
/// <reference path="./tilePortalComponent.ts" />

module eburp {
   export class TilePartyComponent extends eburp.TickedComponent {
      _elapsed: number = 0;
      collideBox: eburp.Rect = new eburp.Rect(0, 0, 0, 0);
      targetPoint: eburp.Point;
      tickRateMS: number = 350;
      velocity: eburp.Point = new eburp.Point(0, 0);
      host:TileObject;

      registerComponent():boolean{
         this.host.point.round();
         this.targetPoint = this.host.point.clone();
         this.host.renderPoint = this.targetPoint.clone();
         return true;
      }

      collideMove(x:number, y:number,results=[]) {
         this.collideBox.point.x = x;
         this.collideBox.point.y = y;
         if (this.host.scene.db.queryRect(this.collideBox, eburp.TileFeatureObject, results)) {
            for (var i = 0; i < results.length; i++) {
               var o:TileFeatureObject = results[i];
               console.log("Collide -> " + o.type);
               if (o.enter && o.enter(this.host) === false) {
                  return true;
               }
            }
         }
         var map = this.host.scene.objectByType(eburp.TileMap);
         if (map) {
            var terrain = map.getTerrain(this.collideBox.point.x, this.collideBox.point.y);
            if (!terrain || !terrain.passable) {
               return true;
            }
         }
         return false;
      }

      updateVelocity(){
         if(!this.host.world || !this.host.world.input){
            return;
         }
         // Touch movement
         var hasCreateTouch = (<any>document).createTouch;
         var worldInput = <any>this.host.world.input;
         if (hasCreateTouch && worldInput.analogVector instanceof eburp.Point) {
            this.velocity.x = 0;
            if (worldInput.analogVector.x < -20) {
               this.velocity.x -= 1;
            } else if (worldInput.analogVector.x > 20) {
               this.velocity.x += 1;
            }
            this.velocity.y = 0;
            if (worldInput.analogVector.y < -20) {
               this.velocity.y -= 1;
            } else if (worldInput.analogVector.y > 20) {
               this.velocity.y += 1;
            }
         } else {
            // Keyboard input
            this.velocity.x = 0;
            if (worldInput.keyDown(eburp.KeyCode.LEFT)) {
               this.velocity.x -= 1;
            }
            if (worldInput.keyDown(eburp.KeyCode.RIGHT)) {
               this.velocity.x += 1;
            }
            this.velocity.y = 0;
            if (worldInput.keyDown(eburp.KeyCode.UP)) {
               this.velocity.y -= 1;
            }
            if (worldInput.keyDown(eburp.KeyCode.DOWN)) {
               this.velocity.y += 1;
            }
         }

      }

      interpolateTick(elapsed:number) {
         if(this.host.spatialDirty){
            this.host.renderPoint.set(this.host.point);
            this.targetPoint.set(this.host.point);
            this.velocity.zero();
            return;
         }
         // Interpolate position based on tickrate and elapsed time
         var factor;
         factor = this._elapsed / this.tickRateMS;
         this.host.renderPoint.set(this.host.point.x, this.host.point.y);
         if (this.velocity.isZero()) {
            return;
         }
         this.host.renderPoint.interpolate(this.host.point, this.targetPoint, factor);
         this.host.renderPoint.x = parseFloat(this.host.renderPoint.x.toFixed(2));
         this.host.renderPoint.y = parseFloat(this.host.renderPoint.y.toFixed(2));
         // console.log("INTERP Vel(#{@velocity.x},#{@velocity.y}) factor(#{factor})")
         // console.log("INTERP From(#{@point.x},#{@point.y}) to (#{@renderPoint.x},#{@renderPoint.y})")

      }

      tick(elapsed:number) {
         this._elapsed += elapsed;
         if (this._elapsed < this.tickRateMS) {
            return;
         }
         // Don't subtract elapsed here, but take the modulus so that
         // if for some reason we get a HUGE elapsed, it just does one
         // tick and keeps the remainder toward the next.
         this._elapsed = this._elapsed % this.tickRateMS;

         // Advance the object if it can be advanced.
         //
         // Check that targetPoint != point first, because or else
         // the collision check will see be against the current position.
         if (!this.targetPoint.equal(this.host.point) && !this.collideMove(this.targetPoint.x, this.targetPoint.y)) {
            this.host.point.set(this.targetPoint);
         }


         // Update Velocity Inputs
         this.updateVelocity();

         // If the next point won't collide then set the new target.
         this.targetPoint.set(this.host.point);
         if (this.velocity.isZero()) {
            return;
         }
         // Check to see if both axes can advance by simply going to the
         // target point.
         this.targetPoint.add(this.velocity);
         if (!this.collideMove(this.targetPoint.x, this.targetPoint.y)) {
         }
         // If not, can we move only along the y axis?
         else if (!this.collideMove(this.host.point.x, this.targetPoint.y)) {
            this.targetPoint.x = this.host.point.x;
         }
         // How about the X axis?  We'll take any axis we can get.
         else if (!this.collideMove(this.targetPoint.x, this.host.point.y)) {
            this.targetPoint.y = this.host.point.y;
         }
         else {
            // Nope, collisions in all directions, just reset the target point
            this.targetPoint.set(this.host.point);
            return;
         }

         // Successful move, collide against target point and check any new tile
         // actions.
         var results = [];
         if (this.host.scene.db.queryRect(this.collideBox, eburp.TileFeatureObject, results)) {
            var obj:TileFeatureObject = results[0];
            var comp = <TilePortalComponent>obj.findComponent(TilePortalComponent);
            if(comp){
               comp.enter(this.host);
            }
         }
      }
   }
}
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
/// <reference path="../sceneObject.ts" />
/// <reference path="../sceneComponent.ts" />
/// <reference path="./collisionComponent.ts" />

module pow2 {
   export class MovableComponent extends TickedComponent {
      _elapsed: number = 0;
      targetPoint: pow2.Point;
      tickRateMS: number = 350;
      velocity: pow2.Point = new pow2.Point(0, 0);
      workPoint: Point = new Point(0,0);
      host: SceneObject;
      collider:CollisionComponent;
      moveFilter:(from:Point,to:Point)=>void;

      connectComponent():boolean{
         this.host.point.round();
         this.targetPoint = this.host.point.clone();
         this.host.renderPoint = this.targetPoint.clone();
         return true;
      }
      syncComponent(){
         super.syncComponent();
         this.collider = <CollisionComponent>this.host.findComponent(CollisionComponent);
      }

      /**
       * Move from one point to another.  Do any custom processing of moves here.
       */
      beginMove(from:Point,to:Point){ }
      endMove(from:Point,to:Point){ }

      collideMove(x:number,y:number,results:SceneObject[]=[]){
         if(!this.collider){
            return false;
         }
         return this.collider.collide(x,y,SceneObject,results);
      }

      /**
       * Support for simple movement filtering by other sources.  For example a sibling
       * component may have a different set of actions that should be evaluated when a
       * move happens.  It can use set/clearMoveFilter to accomplish this.
       *
       * TODO: Is there a better pattern I'm missing for component communication?
       */
      setMoveFilter(filter:(from:Point,to:Point)=>void){
         this.moveFilter = filter;
      }
      clearMoveFilter(){
         this.moveFilter = null;
      }


      updateVelocity(){
         if(!this.host.world || !this.host.world.input){
            return;
         }
         // Touch movement
         var hasCreateTouch = (<any>document).createTouch;
         var worldInput = <any>this.host.world.input;
         if (hasCreateTouch && worldInput.analogVector instanceof pow2.Point) {
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
            if (worldInput.keyDown(pow2.KeyCode.LEFT)) {
               this.velocity.x -= 1;
            }
            if (worldInput.keyDown(pow2.KeyCode.RIGHT)) {
               this.velocity.x += 1;
            }
            this.velocity.y = 0;
            if (worldInput.keyDown(pow2.KeyCode.UP)) {
               this.velocity.y -= 1;
            }
            if (worldInput.keyDown(pow2.KeyCode.DOWN)) {
               this.velocity.y += 1;
            }
         }

      }

      interpolateTick(elapsed:number) {
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
            this.workPoint.set(this.host.point);
            this.host.point.set(this.targetPoint);
            this.endMove(this.workPoint,this.targetPoint);
         }

         // Update Velocity Inputs
         this.updateVelocity();

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

         // Successful move, do something.
         // BEGIN_MOVE
         var moveFn:Function = this.moveFilter || this.beginMove;
         moveFn(this.host.point,this.targetPoint);
      }
   }
}
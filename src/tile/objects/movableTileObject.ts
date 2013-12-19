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

/// <reference path="../../typedef/underscore/underscore.d.ts" />
/// <reference path="../../core/point.ts" />
/// <reference path="../../core/rect.ts" />
/// <reference path="../../scene/sceneObject.ts" />
/// <reference path="../tileObject.ts" />
/// <reference path="../tileMap.ts" />

module eburp {
    export class MovableTileObject extends eburp.TileObject {
        _elapsed: number;
        collideBox: eburp.Rect;
        point: eburp.Point;
        targetPoint: eburp.Point;
        renderPoint: eburp.Point;
        tickRateMS: number;
        velocity: eburp.Point;

        constructor(options?: any) {
            options = _.defaults(options || {}, {
                velocity: new eburp.Point(0, 0),
                tickRateMS: 350,
                renderPoint: new eburp.Point(0, 0)
            });
            this._elapsed = 0;
            this.collideBox = new eburp.Rect(0, 0, 0, 0);
            super(options)
            this.point.round();
            this.targetPoint = this.point.clone();
            return this;
        }

        collideMove(x:number, y:number) {
            var map, o, results, terrain, _i, _len;
            results = [];
            this.collideBox.point.x = x;
            this.collideBox.point.y = y;
            if (this.scene.db.queryRect(this.collideBox, eburp.TileFeatureObject, results)) {
                for (_i = 0, _len = results.length; _i < _len; _i++) {
                    o = results[_i];
                    console.log("Collide -> " + o.type);
                    if (o.enter && o.enter(this) === false) {
                        return true;
                    }
                }
            }
            map = this.scene.objectByType(eburp.TileMap);
            if (map) {
                terrain = map.getTerrain(this.collideBox.point.x, this.collideBox.point.y);
                if (!terrain || !terrain.passable) {
                    return true;
                }
            }
            return false;
        }

        setPoint(point) {
            this.targetPoint = point.clone();
            return this.point = point.clone();
        }

        interpolateTick(elapsed:number) {
            // Interpolate position based on tickrate and elapsed time
            var factor;
            factor = this._elapsed / this.tickRateMS;
            this.renderPoint.set(this.point.x, this.point.y);
            if (this.velocity.isZero()) {
                return;
            }
            this.renderPoint.interpolate(this.point, this.targetPoint, factor);
            this.renderPoint.x = parseFloat(this.renderPoint.x.toFixed(2));
            this.renderPoint.y = parseFloat(this.renderPoint.y.toFixed(2));
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
            if (!this.targetPoint.equal(this.point) && !this.collideMove(this.targetPoint.x, this.targetPoint.y)) {
                this.point.set(this.targetPoint);
            }

            // Touch movement
            var hasCreateTouch = (<any>document).createTouch;
            var worldInput = <any>this.world.input;
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

            // If the next point won't collide then set the new target.
            this.targetPoint.set(this.point);
            if (this.velocity.isZero()) {
                return;
            }
            // Check to see if both axes can advance by simply going to the
            // target point.
            this.targetPoint.add(this.velocity);
            if (!this.collideMove(this.targetPoint.x, this.targetPoint.y)) {
                return;
            }
            // If not, can we move only along the y axis?
            if (!this.collideMove(this.point.x, this.targetPoint.y)) {
                this.targetPoint.x = this.point.x;
                return;
            }
            // How about the X axis?  We'll take any axis we can get.
            if (!this.collideMove(this.targetPoint.x, this.point.y)) {
                this.targetPoint.y = this.point.y;
                return;
            }
            // Nope, collisions in all directions, just reset the target point
            this.targetPoint.set(this.point);

        //
        //
        //     if @collideMove @targetPoint.x, @targetPoint.y
        //        @targetPoint.set(@point)

        }
    }
}
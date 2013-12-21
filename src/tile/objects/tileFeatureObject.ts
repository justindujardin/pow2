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

// Not sure how to tie this in yet, maybe a state machine for dealing with
// different feature types?
module eburp {
    export class TileFeatureObject extends eburp.TileObject {
        point: eburp.Point;
        x: number; // TODO: redundant with point?
        y: number;
        icon: any; // TODO: typedef
        iconCoords: any; //TODO: typedef
        type: string; // TODO: enum?
        passable: boolean;
        tileMap:TileMap;

        constructor(options?) {
            super(options);
            _.extend(this, _.defaults(options || {}, {
                type: "",
                x: 0,
                y: 0,
                icon: ""
                //passable: false; // TODO: is this correct default?
            }));
            this.point.x = this.x;
            this.point.y = this.y;
        }

        onAddToScene(scene) {
            if (!this.icon) {
                return;
            }
            this.iconCoords = this.world.sprites.getSpriteCoords(this.icon);
            return this.world.sprites.getSpriteSheet(this.iconCoords.source, (image) => {
                return this.image = image.data;
            });
        }

        // An object will enter this feature if false is not returned
        enter(object:SceneObject):boolean {
           return this.type !== 'block' && this.passable !== false;
        }

        // An object will exit this feature if false is not returned (TODO: false or falsey?  returning falsey now)
        exit(object:SceneObject) {
        }
    }
}
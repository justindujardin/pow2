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

/// <reference path="../typedef/underscore/underscore.d.ts" />
/// <reference path="../core/point.ts" />
/// <reference path="../core/rect.ts" />
/// <reference path="SceneObject.ts" />

// Very, very simple spatial database.  Because all the game objects have
// an extent of 1 unit, we can just do a point in rect to determine object hits.
module eburp {
    export class SceneSpatialDatabase {
        private _objects: SceneObject[];

        constructor() {
            this._objects = [];
        }
        addSpatialObject(obj: any) { // TODO: should be eburp.SceneObject, but it doesn't have .point
            if (obj && obj.point instanceof eburp.Point) {
                this._objects.push(obj);
            }
        }

        removeSpatialObject(obj: eburp.SceneObject) {
            this._objects = _.filter(this._objects, function(o) {
                return o.id !== obj.id;
            });
        }

        queryRect(rect:eburp.Rect, type, results:SceneObject[]):boolean {
            var foundAny:boolean;
            if (!results) {
                throw new Error("Results array must be provided to query scene spatial database");
            }
            foundAny = false;
            var list = this._objects;
            var i:number,len:number,o;
            for (i = 0, len = list.length; i < len; i++) {
                o = list[i];
                if (type && !(o instanceof type)) {
                    continue;
                }
                if (o.point && this.pointInRect(rect, o.point)) {
                    results.push(o);
                    foundAny = true;
                }
            }
            return foundAny;
        }

        pointInRect(rect: eburp.Rect, point: eburp.Point):boolean {
            if (point.x < rect.point.x || point.y < rect.point.y) {
                return false;
            }
            if (point.x >= rect.point.x + rect.extent.x || point.y >= rect.point.y + rect.extent.y) {
                return false;
            }
            return true;
        }
    }
}

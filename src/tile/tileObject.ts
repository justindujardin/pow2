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
/// <reference path="../scene/sceneObject.ts" />

module eburp {
    export class TileObject extends eburp.SceneObject {
        point: eburp.Point;
        rotation: number;
        image: any; // TODO typedef

        constructor(options?: any) {
            super(options);

            _.extend(this, _.defaults(options || {}, {
                point: new eburp.Point(0, 0),
                rotation: 0,
                image: null
            }));
            return this;
        }
    }
}
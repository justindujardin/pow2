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
      type: string; // TODO: enum?
      passable:boolean;
      data: {}; // A copy of the original feature object data.
      constructor(options:any) {
         super(options);
         this.point.x = options.x;
         this.point.y = options.y;
         this.type = options.type;
         this.data = options;
      }
   }
}
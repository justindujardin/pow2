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

/// <reference path="../../../types/underscore/underscore.d.ts" />
/// <reference path="../../core/point.ts" />
/// <reference path="../../core/rect.ts" />
/// <reference path="../../scene/sceneObject.ts" />
/// <reference path="../../scene/sceneObjectRenderer.ts" />
/// <reference path="../tileObject.ts" />
/// <reference path="../tileMap.ts" />

module pow2 {
   export class TileObjectRenderer extends pow2.SceneObjectRenderer {
      render(object:any, data:any, view:pow2.SceneView) { // TODO: typedef

         if (!data.image || !object.visible) {
            return;
         }
         var point = (object.renderPoint || object.point).clone();
         point.x -= object.size.x / 2;
         point.y -= object.size.y / 2;
         point = view.worldToScreen(point);


         var width = view.unitSize;
         var height = view.unitSize;
         if (data.icon && data.meta) {
            var c = data.meta;
            var cx = c.x;
            var cy = c.y;
            if(data.meta.frames > 1){
               var fx = (data.frame % (c.width));
               var fy = Math.floor((data.frame - fx) / c.width);
               cx += fx * view.unitSize;
               cy += fy * view.unitSize;
            }
            return view.context.drawImage(data.image, cx, cy, view.unitSize, view.unitSize, point.x, point.y, width, height);
         } else {
            return view.context.drawImage(data.image, point.x, point.y, width, height);
         }
      }
   }
}
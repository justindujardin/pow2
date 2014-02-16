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

         // Build render data.
         var point = (object.renderPoint || object.point).clone();
         var c = data.meta; // TODO: interface this
         var sourceWidth:number = view.unitSize;
         var sourceHeight:number = view.unitSize;
         if(c && typeof c.cellWidth !== 'undefined' && typeof c.cellHeight !== 'undefined') {
            sourceWidth = c.cellWidth;
            sourceHeight = c.cellHeight;
         }
         var objWidth = view.screenToWorld(sourceWidth);
         var objHeight = view.screenToWorld(sourceHeight);
         point.x -= objWidth * object.scale / 2;
         point.y -= objHeight * object.scale / 2;
         point = view.worldToScreen(point);

         if (data.icon && data.meta) {
            var cx = c.x;
            var cy = c.y;
            if(data.meta.frames > 1){
               if(data.frame > 4){
                  var bar = "baz";
               }
               var cwidth = c.width / view.unitSize;
               var fx = (data.frame % (cwidth));
               var fy = Math.floor((data.frame - fx) / cwidth);
               cx += fx * sourceWidth;
               cy += fy * sourceHeight;
            }
            view.context.drawImage(data.image, cx, cy, sourceWidth, sourceHeight, point.x, point.y, sourceWidth * object.scale, sourceHeight * object.scale);
         } else {
            view.context.drawImage(data.image, point.x, point.y, sourceWidth * object.scale, sourceHeight * object.scale);
         }
      }
   }
}
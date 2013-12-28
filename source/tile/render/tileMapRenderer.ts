/*
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

/// <reference path="../../scene/sceneObjectRenderer.ts" />
/// <reference path="../tileObject.ts" />
/// <reference path="../tileMapView.ts" />
/// <reference path="../tileMap.ts" />

module pow2 {
   export class TileMapRenderer extends pow2.SceneObjectRenderer {
      render(object:TileMap, view:TileMapView) {
         var sheets = {};
         var clipRect:Rect = view.getCameraClip();
         var xEnd = clipRect.getRight();
         var yEnd = clipRect.getBottom();
         for(var x = clipRect.point.x; x < xEnd; x++){
            for(var y = clipRect.point.y; y < yEnd; y++){
               var texture = object.getTerrainTexture(x, y);
               if (texture) {
                  // Keep this inline to avoid more function calls.
                  var desc, dstH, dstW, dstX, dstY, image, srcH, srcW, srcX, srcY;
                  desc = pow2.data.sprites[texture];
                  image = sheets[desc.source] = sheets[desc.source] || view.getSpriteSheet(desc.source);
                  if (!image || !image.isReady()) {
                     continue;
                  }
                  srcX = desc.x;
                  srcY = desc.y;
                  srcW = srcH = view.unitSize;
                  dstX = x * view.unitSize * view.cameraScale;
                  dstY = y * view.unitSize * view.cameraScale;
                  dstW = dstH = view.unitSize * view.cameraScale;
                  view.context.drawImage(image.data, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH);
               }
            }
         }
      }
   }
}
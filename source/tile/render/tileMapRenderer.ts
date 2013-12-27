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
/// <reference path="../tileMap.ts" />

module eburp {
   export class TileMapRenderer extends eburp.SceneObjectRenderer {
      render(object:TileMap, view:eburp.SceneView) {
         var x, y, _i, _j, _ref, _ref1, _ref2, _ref3;
         var clipRect:Rect = (<any>view).getCameraClip();
         for (x = _i = _ref = clipRect.point.x, _ref1 = clipRect.getRight(); _ref <= _ref1 ? _i < _ref1 : _i > _ref1; x = _ref <= _ref1 ? ++_i : --_i) {
            for (y = _j = _ref2 = clipRect.point.y, _ref3 = clipRect.getBottom(); _ref2 <= _ref3 ? _j < _ref3 : _j > _ref3; y = _ref2 <= _ref3 ? ++_j : --_j) {
               var tile = object.getTerrainIcon(x, y);
               if (tile) {
                  this.drawTile(view,tile, x, y);
               }
            }
         }
      }

      /*
       * Asynchronous sprite resource validation.
       */
      _validateImage(view:SceneView,name) {
         var desc, image;
         desc = eburp.data.sprites[name];
         if (!desc) {
            throw new Error("Missing sprite data for: " + name);
         }
         image = view.getSpriteSheet(desc.source);
         if (!image) {
            throw new Error("Missing image from source: " + desc.source);
         }
         return image.isReady();
      }

      drawTile(view:SceneView,icon:string, x:number, y:number, scale:number=1) {
         var desc, dstH, dstW, dstX, dstY, image, srcH, srcW, srcX, srcY;
         if (!this._validateImage(view,icon)) {
            return;
         }
         desc = eburp.data.sprites[icon];
         image = view.getSpriteSheet(desc.source);
         if (!image || !image.isReady()) {
            return;
         }
         srcX = desc.x;
         srcY = desc.y;
         srcW = srcH = view.unitSize;
         dstX = x * view.unitSize * view.cameraScale * scale;
         dstY = y * view.unitSize * view.cameraScale * scale;
         dstW = dstH = view.unitSize * view.cameraScale * scale;
         if (scale !== 1.0) {
            dstX += (dstW * scale) / 4;
            dstY += (dstH * scale) / 4;
         }
         view.context.drawImage(image.data, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH);
      }

   }
}
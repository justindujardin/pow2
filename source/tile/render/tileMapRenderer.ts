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
      buffer:HTMLCanvasElement[][] = null;
      bufferMapName:string = null;
      render(object:TileMap, view:TileMapView) {
         var sheets = {};
         var squareUnits = 16;
         var squareSize = squareUnits * view.unitSize;
         if(!object.isLoaded()){
            return;
         }
         if(this.buffer === null || this.bufferMapName === null || this.bufferMapName !== object.mapName){
            var tileUnitSize = squareSize / view.unitSize;
            // Unit size is 16px, so rows/columns should be 16*16 for 256px each.
            var columns = Math.ceil(object.bounds.extent.x / squareUnits);
            var rows = Math.ceil(object.bounds.extent.y / squareUnits);
            this.buffer = new Array(columns);
            for(var col:number = 0; col < columns; col++){
               this.buffer[col] = new Array(rows);
            }
            for(var col:number = 0; col < columns; col++){
               for(var row:number = 0; row < rows; row++){
                  var xOffset = col * tileUnitSize;
                  var xEnd = xOffset + tileUnitSize;
                  var yOffset = row * tileUnitSize;
                  var yEnd = yOffset + tileUnitSize;
                  this.buffer[col][row] = view.renderToCanvas(squareSize,squareSize,(ctx) => {
                     for(var x = xOffset; x < xEnd; x++){
                        for(var y = yOffset; y < yEnd; y++){
                           var texture = object.getTerrainTexture(x, y);
                           if (texture) {
                              // Keep this inline to avoid more function calls.
                              var desc, dstH, dstW, dstX, dstY, srcH, srcW, srcX, srcY;
                              desc = pow2.data.sprites[texture];
                              var image = sheets[desc.source] = sheets[desc.source] || view.getSpriteSheet(desc.source);
                              if (!image || !image.isReady()) {
                                 continue;
                              }
                              srcX = desc.x;
                              srcY = desc.y;
                              srcW = srcH = view.unitSize;
                              dstX = (x - xOffset) * view.unitSize;
                              dstY = (y - yOffset) * view.unitSize;
                              dstW = dstH = view.unitSize;
                              ctx.drawImage(image.data, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH);
                           }
                        }
                     }
                     // Append chunks to body (DEBUG HACKS)

                     // var dataImage = new Image();
                     // dataImage.src = ctx.canvas.toDataURL();
                     // $('body').append(dataImage);
                  });
               }
            }
            this.bufferMapName = object.mapName;
         }
         var squareScreen = view.worldToScreen(squareUnits);

         var clipRect = view.worldToScreen(view.getCameraClip());
         var cols:number = this.buffer.length;
         var rows:number = this.buffer[0].length;
         // Unit size is 16px, so rows/columns should be 16*16 for 256px each.
         for(var col:number = 0; col < cols; col++){
            for(var row:number = 0; row < rows; row++){
               var renderRect:Rect = view.worldToScreen(new Rect(col * squareUnits - 0.5,row * squareUnits - 0.5,squareUnits,squareUnits));
               if(!renderRect.intersect(clipRect)){
                  continue;
               }
               //console.log("Tile " + renderRect.toString())
               view.context.drawImage(this.buffer[col][row],
                  // From source
                  0,
                  0,
                  squareSize,
                  squareSize,
                  // Scaled to camera
                  renderRect.point.x,
                  renderRect.point.y,
                  squareScreen + 1,
                  squareScreen + 1);
            }
         }
      }
   }
}
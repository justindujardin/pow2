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

/// <reference path="../../lib/pow2.d.ts"/>
/// <reference path="./tileObject.ts"/>
/// <reference path="./tileMap.ts"/>
/// <reference path="./components/tileMapCameraComponent.ts"/>
/// <reference path="./render/tileObjectRenderer.ts"/>
/// <reference path="./render/tileMapRenderer.ts"/>

module pow2{
   export class TileMapView extends SceneView {
      objectRenderer:TileObjectRenderer = new TileObjectRenderer;
      mapRenderer:TileMapRenderer = new TileMapRenderer;
      tileMap:TileMap = null;
      world:SceneWorld;

      setTileMap(tileMap:TileMap){
         this.tileMap = tileMap;
      }

      setScene(scene:Scene){
         if(scene === this.scene){
            return;
         }
         this.cameraComponent = null;
         super.setScene(scene);
      }

      /*
       * Get the camera clip rectangle.
       * @returns {pow2.Rect}
       */
      getCameraClip() {
         if (!this.tileMap) {
            return this.camera;
         }
         var clipGrow = this.camera.clone();
         clipGrow.point.round();
         clipGrow.extent.round();

         // Clamp to tilemap bounds.
         var rect:IRect = this.tileMap.bounds;
         if(clipGrow.point.x < rect.point.x){
            clipGrow.point.x += rect.point.x - clipGrow.point.x;
         }
         if(clipGrow.point.y < rect.point.y){
            clipGrow.point.y += rect.point.y - clipGrow.point.y;
         }
         if(clipGrow.point.x + clipGrow.extent.x > rect.point.x + rect.extent.x){
            clipGrow.point.x -= ((clipGrow.point.x + clipGrow.extent.x) - (rect.point.x + rect.extent.x));
         }
         if(clipGrow.point.y + clipGrow.extent.y > rect.point.y + rect.extent.y){
            clipGrow.point.y -= ((clipGrow.point.y + clipGrow.extent.y) - (rect.point.y + rect.extent.y));
         }
         return clipGrow;
      }

      /*
       * Set the pre-render canvas state.
       */
      setRenderState() {
         var worldCameraPos, worldTilePos;
         super.setRenderState();
         if (!this.camera || !this.context || !this.tileMap) {
            return;
         }
         worldTilePos = this.worldToScreen(this.tileMap.bounds.point);
         worldTilePos.x = parseFloat(worldTilePos.x.toFixed(2));
         worldTilePos.y = parseFloat(worldTilePos.y.toFixed(2));
         worldCameraPos = this.worldToScreen(this.camera.point);
         worldCameraPos.x = parseFloat(worldCameraPos.x.toFixed(2));
         worldCameraPos.y = parseFloat(worldCameraPos.y.toFixed(2));
         this.context.translate(worldTilePos.x - worldCameraPos.x, worldTilePos.y - worldCameraPos.y);
      }

      /*
       * Render the tile $map, and any features it has.
       */
      renderFrame(elapsed) {
         this.clearRect();
         if (!this.tileMap) {
            return;
         }
         this.mapRenderer.render(this.tileMap,this);
         return this;
      }

      /*
       * Draw any post-rendering effects.
       */
      renderPost() {
         if (!this.camera || !this.context || !this.tileMap) {
            return;
         }
         this.renderAnalog();
      }

      /*
       * Render the analog joystick for touch inputs.
       */
      renderAnalog() {
         var screenCamera, touch, touchCurrent, touchStart, _i, _len, _ref;
         if (!this.world || !this.world.input) {
            return;
         }
         var inputAny:any = this.world.input;
         if (typeof inputAny.touches !== 'undefined') {
            screenCamera = this.worldToScreen(this.camera.point);
            touchStart = inputAny.touchStart.clone().add(screenCamera);
            touchCurrent = inputAny.touchCurrent.clone().add(screenCamera);
            this.context.save();
            _ref = inputAny.touches;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
               touch = _ref[_i];
               if (touch.identifier === inputAny.touchId) {
                  this.context.beginPath();
                  this.context.strokeStyle = "cyan";
                  this.context.lineWidth = 6;
                  this.context.arc(touchStart.x, touchStart.y, 40, 0, Math.PI * 2, true);
                  this.context.stroke();
                  this.context.beginPath();
                  this.context.strokeStyle = "cyan";
                  this.context.lineWidth = 2;
                  this.context.arc(touchStart.x, touchStart.y, 60, 0, Math.PI * 2, true);
                  this.context.stroke();
                  this.context.beginPath();
                  this.context.strokeStyle = "cyan";
                  this.context.arc(touchCurrent.x, touchCurrent.y, 40, 0, Math.PI * 2, true);
                  this.context.stroke();
                  this.context.fillStyle = "white";
               }
            }
            this.context.restore();
         }
         return this;
      }
   }
}

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

/// <reference path="../scene/sceneObject.ts"/>
/// <reference path="./tileObject.ts"/>
/// <reference path="./tileMap.ts"/>
/// <reference path="./render/tileObjectRenderer.ts"/>
/// <reference path="./render/tileMapRenderer.ts"/>
/// <reference path="./components/tilePartyComponent.ts"/>

module eburp{
   export class TileMapView extends SceneView {
      objectRenderer:TileObjectRenderer = new TileObjectRenderer;
      mapRenderer:TileMapRenderer = new TileMapRenderer;
      tracking:TileObject = null;
      tileMap:TileMap = null;

      /*
       * Set the camera to track a given object.
       */
      trackObject(tileObject) {
         this.tracking = tileObject;
      }

      /*
       * Update the camera for this frame.
       */
      processCamera() {
         super.processCamera();
         this.cameraScale = Math.round(this.cameraScale);
         var canvasSize = this.screenToWorld(new Point(this.context.canvas.width,this.context.canvas.height),this.cameraScale);
         this.camera.extent.set(canvasSize);
         if (this.tracking && this.tracking instanceof eburp.TileObject) {
            this.camera.setCenter(this.tracking.renderPoint || this.tracking.point);
         }
         return this;
      }

      /*
       * Get the camera clip rectangle.
       * @returns {eburp.Rect}
       */
      getCameraClip() {
         var clipGrow, clipRect;
         if (!this.tileMap) {
            return this.camera;
         }
         clipGrow = this.camera.clone().round();
         clipRect = clipGrow.clamp(this.tileMap.bounds).inflate(1).round();
         return clipRect;
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
       * Render the tile map, and any features it has.
       */
      renderFrame(elapsed) {
         this.clearRect();
         if (!this.tileMap) {
            return;
         }
         var clipRect:Rect = this.getCameraClip();
         this.mapRenderer.render(this.tileMap,this);
         this.renderObjects(clipRect, elapsed);
         return this;
      }

      /*
       * Render the TileObjects in the scene.
       */
      renderObjects(clipRect, elapsed) {
         var objects = this.scene.objectsByType(eburp.TileFeatureObject);
         _.each(objects, (object) => {
            return this.objectRenderer.render(object,this);
         });
         var player = this.scene.objectByComponent(eburp.TilePartyComponent);
         if (player) {
            this.objectRenderer.render(player, this);
         }
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


      /*
       * Render Tile debug information. TODO: This is horrendous.
       */
      debugRender(debugStrings: string[] = []) {
         var clipRect, player, screenClip, tile, tiles, x, y, _i, _j, _ref, _ref1, _ref2, _ref3,
            _this = this;
         if (debugStrings == null) {
            debugStrings = [];
         }
         debugStrings.push("Camera: (" + this.camera.point.x + "," + this.camera.point.y + ")");
         player = this.scene.objectByComponent(eburp.TilePartyComponent);
         if (player) {
            debugStrings.push("Player: (" + player.point.x + "," + player.point.y + ")");
         }
         clipRect = this.getCameraClip();
         debugStrings.push("Clip: (" + clipRect.point.x + "," + clipRect.point.y + ") (" + clipRect.extent.x + "," + clipRect.extent.y + ")");
         this.context.strokeStyle = "#FF2222";
         screenClip = this.worldToScreen(clipRect);
         this.context.strokeRect(screenClip.point.x, screenClip.point.y, screenClip.extent.x, screenClip.extent.y);

         this.context.strokeStyle = "#FF2222";
         for (x = _i = _ref = clipRect.point.x, _ref1 = clipRect.getRight(); _ref <= _ref1 ? _i < _ref1 : _i > _ref1; x = _ref <= _ref1 ? ++_i : --_i) {
            for (y = _j = _ref2 = clipRect.point.y, _ref3 = clipRect.getBottom(); _ref2 <= _ref3 ? _j < _ref3 : _j > _ref3; y = _ref2 <= _ref3 ? ++_j : --_j) {
               tile = this.tileMap.getTerrain(x, y);
               if (tile && !tile.passable) {
                  this.context.strokeRect(x * this.unitSize * this.cameraScale, y * this.unitSize * this.cameraScale, this.cameraScale * this.unitSize, this.cameraScale * this.unitSize);
               }
            }
         }
         _this.context.strokeStyle = "#2222FF";
         tiles = this.scene.objectsByType(eburp.TileObject);
         _.each(tiles, function(object:any) {
            var point;
            point = object.renderPoint || object.point;
            return _this.context.strokeRect(point.x * _this.unitSize * _this.cameraScale, point.y * _this.unitSize * _this.cameraScale, _this.cameraScale * _this.unitSize, _this.cameraScale * _this.unitSize);
         });
         return super.debugRender(debugStrings);
      }
   }
}

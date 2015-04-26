/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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

/// <reference path="./tileObject.ts"/>
/// <reference path="./tileMap.ts"/>
/// <reference path="./components/tileMapCameraComponent.ts"/>
/// <reference path="./render/tileObjectRenderer.ts"/>
/// <reference path="./render/tileMapRenderer.ts"/>

module pow2.tile {
  export class TileMapView extends pow2.scene.SceneView {
    objectRenderer:pow2.tile.render.TileObjectRenderer = new pow2.tile.render.TileObjectRenderer;
    mapRenderer:pow2.tile.render.TileMapRenderer = new pow2.tile.render.TileMapRenderer;
    tileMap:TileMap = null;
    world:pow2.scene.SceneWorld;

    setTileMap(tileMap:TileMap) {
      this.tileMap = tileMap;
    }

    setScene(scene:pow2.scene.Scene) {
      if (scene === this.scene) {
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
      if (clipGrow.point.x < rect.point.x) {
        clipGrow.point.x += rect.point.x - clipGrow.point.x;
      }
      if (clipGrow.point.y < rect.point.y) {
        clipGrow.point.y += rect.point.y - clipGrow.point.y;
      }
      if (clipGrow.point.x + clipGrow.extent.x > rect.point.x + rect.extent.x) {
        clipGrow.point.x -= ((clipGrow.point.x + clipGrow.extent.x) - (rect.point.x + rect.extent.x));
      }
      if (clipGrow.point.y + clipGrow.extent.y > rect.point.y + rect.extent.y) {
        clipGrow.point.y -= ((clipGrow.point.y + clipGrow.extent.y) - (rect.point.y + rect.extent.y));
      }
      return clipGrow;
    }

    /*
     * Update the camera for this frame.
     */
    processCamera() {
      this.cameraComponent = <pow2.scene.components.CameraComponent>this.findComponent(pow2.scene.components.CameraComponent);
      if (!this.cameraComponent && this.tileMap) {
        this.cameraComponent = <pow2.scene.components.CameraComponent>this.tileMap.findComponent(pow2.scene.components.CameraComponent);
      }
      if (!this.cameraComponent) {
        this.cameraComponent = <pow2.scene.components.CameraComponent>this.scene.componentByType(pow2.scene.components.CameraComponent);
      }
      super.processCamera();
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
    renderFrame(elapsed:number) {
      this.clearRect();
      if (!this.tileMap) {
        return;
      }
      this.mapRenderer.render(this.tileMap, this);
      return this;
    }

    /*
     * Draw any post-rendering effects.
     */
    renderPost() {
    }
  }
}

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

/// <reference path="./../tile/tileMapView.ts"/>
/// <reference path="./../tile/render/tileObjectRenderer.ts"/>
/// <reference path="./components/gamePartyComponent.ts"/>

module pow2{
   export class GameMapView extends TileMapView {
      objectRenderer:TileObjectRenderer = new TileObjectRenderer;
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
         if (this.tracking && this.tracking instanceof pow2.TileObject) {
            this.camera.setCenter(this.tracking.renderPoint || this.tracking.point);
         }
         return this;
      }

      /*
       * Render the tile map, and any features it has.
       */
      renderFrame(elapsed) {
         super.renderFrame(elapsed);
         var objects = this.scene.objectsByType(pow2.GameFeatureObject);
         _.each(objects, (object) => {
            return this.objectRenderer.render(object,this);
         });
         var player = this.scene.objectByComponent(pow2.GamePartyComponent);
         if (player) {
            this.objectRenderer.render(player, this);
         }
         return this;
      }
   }
}

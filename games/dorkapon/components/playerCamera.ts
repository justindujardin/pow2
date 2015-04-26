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

///<reference path="../index.ts"/>

module dorkapon.components {

  /**
   * A centered camera on the host object, that is clamped
   * inside the tile map.  The result is that the player will
   * be camera center at all times except when he is near an
   * edge of the map.
   */
  export class PlayerCamera extends pow2.scene.components.CameraComponent {
    host:objects.DorkaponEntity;
    // Pre allocate spatial objects for this component because cameras are
    // updated every frame.
    private _worker:pow2.Point = new pow2.Point();
    private _workerRect:pow2.Rect = new pow2.Rect();

    process(view:pow2.tile.TileMapView) {
      super.process(view);
      if (view.tileMap) {
        // Center on host object
        view.camera.setCenter(this.host.renderPoint || this.host.point);

        // Clamp point to lower-right.
        view.camera.point.x = Math.min(view.camera.point.x, view.tileMap.bounds.extent.x - view.camera.extent.x);
        view.camera.point.y = Math.min(view.camera.point.y, view.tileMap.bounds.extent.y - view.camera.extent.y);

        // Clamp to top-left.
        view.camera.point.x = Math.max(-0.5, view.camera.point.x);
        view.camera.point.y = Math.max(-0.5, view.camera.point.y);

      }
    }
  }

}
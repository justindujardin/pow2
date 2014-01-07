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

/// <reference path="../tileMap.ts" />
/// <reference path="../../scene/components/cameraComponent.ts" />

module pow2 {
   export class TileMapCameraComponent extends CameraComponent {
      host:TileMap;
      connectComponent():boolean {
         return super.connectComponent() && this.host instanceof TileMap;
      }
      process(view:SceneView) {
         view.camera.point.set(this.host.bounds.point);
         view.cameraScale = Math.min(4,Math.round(view.screenToWorld(view.context.canvas.width) / view.camera.extent.x));
         var canvasSize = view.screenToWorld(new Point(view.context.canvas.width,view.context.canvas.height),view.cameraScale);
         view.camera.extent.set(canvasSize);
      }
  }
}
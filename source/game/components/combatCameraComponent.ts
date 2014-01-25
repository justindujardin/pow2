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

/// <reference path="../gameTileMap.ts" />
/// <reference path="../../scene/components/cameraComponent.ts" />
/// <reference path="./playerComponent.ts" />

module pow2 {
   export class CombatCameraComponent extends CameraComponent {
      host:GameTileMap;
      connectComponent():boolean {
         return super.connectComponent() && this.host instanceof GameTileMap;
      }
      process(view:SceneView) {
         if(!this.host){
            super.process(view);
            return;
         }
         view.camera = new Rect(1000000,1000000,-1000000,-1000000);
         // TODO: Do this feature lookup in syncComponent rather than each frame.
         for(var i = 0; i < 4; i++){
            var battleSpawn = this.host.getFeature('p' + (i + 1));
            if(!battleSpawn){
               continue;
            }
            view.camera.addPoint(new Point(battleSpawn.x / 16, battleSpawn.y / 16));
         }
         for(var i = 0; i < 9; i++){
            var battleSpawn = this.host.getFeature('e' + (i + 1));
            if(!battleSpawn){
               continue;
            }
            view.camera.addPoint(new Point(battleSpawn.x / 16, battleSpawn.y / 16));
         }
         var center = view.camera.getCenter();
         view.cameraScale = view.context.canvas.width > 768 ? 4 : 2;
         view.camera = view.screenToWorld(new Rect(0,0,view.context.canvas.width,view.context.canvas.height),view.cameraScale);
         view.camera.setCenter(center);
      }
   }
}

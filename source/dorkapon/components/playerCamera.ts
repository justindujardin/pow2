/*
 Copyright (C) 2013-2014 by Justin DuJardin and Contributors

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

   export class PlayerCamera extends pow2.CameraComponent {
      host:pow2.TileObject;
      process(view:pow2.TileMapView) {
         super.process(view);
         if(view.tileMap){
            // Center on tilemap
            view.camera.setCenter(this.host.renderPoint || this.host.point);

            // Center in viewport if tilemap is smaller than camera.
            if(view.tileMap.bounds.extent.x < view.camera.extent.x){
               view.camera.point.x = (view.tileMap.bounds.extent.x - view.camera.extent.x) / 2;
            }
            if(view.tileMap.bounds.extent.y < view.camera.extent.y){
               view.camera.point.y = (view.tileMap.bounds.extent.y - view.camera.extent.y) / 2;
            }
         }
      }
   }

}
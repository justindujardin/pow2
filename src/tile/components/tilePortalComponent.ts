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

/// <reference path="../../core/point.ts" />
/// <reference path="../../scene/sceneComponent.ts" />
/// <reference path="../tileObject.ts" />
/// <reference path="../tileMap.ts" />

module eburp {
   export class TilePortalComponent extends SceneComponent {
      tileMap:TileMap;
      host:TileObject;
      map:string;
      target:Point;
      constructor(map:string,target:Point){
         super();
         this.map = map;
         this.target = target;
      }
      registerComponent():boolean{
         this.tileMap = this.host.tileMap;
         return !!this.tileMap;
      }
      enter(object:TileObject):boolean {
         if(!this.target || !this.tileMap){
            return false;
         }
         console.log("Transition to: " + this.map);
         object.setPoint(this.target);
         this.tileMap.setMap(this.map);
         return true;
      }

   }

}
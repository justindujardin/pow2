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

/// <reference path="../../scene/sceneComponent.ts" />
/// <reference path="../../tile/tileObject.ts" />
/// <reference path="../objects/gameFeatureObject.ts" />
/// <reference path="../../core/stateMachine.ts" />
/// <reference path="./playerComponent.ts" />

module pow2 {
   export class GameFeatureInputComponent extends TickedComponent {
      hitBox:Rect = new Rect(0,0,1,1);
      hits:TileObject[] = [];
      mouse:NamedMouseElement = null;

      syncComponent():boolean{
         if(!super.syncComponent() || !this.scene || !this.scene.world || !this.scene.world.input){
            return false;
         }
         this.mouse = this.scene.world.input.getMouseHook("world");
         return !!this.mouse;
      }

      tick(elapsed:number) {
         // Calculate hits in Scene for machine usage.
         if(!this.scene || !this.mouse){
            return;
         }
         _.each(this.hits,(tile:TileObject) => {
            tile.scale = 1;
         });

         // Quick array clear
         this.hits.length = 0;

         this.hitBox.point.set(this.mouse.world);
         this.host.scene.db.queryRect(this.hitBox, GameFeatureObject, this.hits);

         _.each(this.hits,(obj:any) => {
            obj.scale = 1.25;
         });
         super.tick(elapsed);
      }
  }
}
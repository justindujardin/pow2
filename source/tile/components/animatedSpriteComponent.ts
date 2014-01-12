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

/// <reference path="../../../types/backbone/backbone.d.ts" />
/// <reference path="../../scene/components/movableComponent.ts" />
/// <reference path="../../scene/sceneComponent.ts" />
/// <reference path="../../tile/tileObject.ts" />
/// <reference path="./spriteComponent.ts" />

module pow2 {
   export class AnimatedSpriteComponent extends TickedComponent {
      host:TileObject;
      _elapsed: number = 0;
      private _renderFrame:number = 3;
      lengthMS:number = 500;
      spriteComponent:SpriteComponent;
      spriteName:string;
      constructor(spriteName:string){
         super();
         this.spriteName = spriteName;
      }

      connectComponent():boolean {
         this._renderFrame = 0;
         this._elapsed = 0;
         return super.connectComponent()
      }
      syncComponent():boolean {
         if(!super.syncComponent()){
            return false;
         }
         var sprites = <SpriteComponent[]>this.host.findComponents(SpriteComponent);
         this.spriteComponent = _.where(sprites,{name:this.spriteName})[0];
         return !!this.spriteComponent;
      }
      tick(elapsed:number){
         this._elapsed += elapsed;
         if(this._elapsed >= this.lengthMS){
            this.trigger('anim:done');
            this._elapsed = this._elapsed % this.lengthMS;
         }
         super.tick(elapsed);
      }

      interpolateTick(elapsed:number) {
         if(this.spriteComponent){
            // Choose frame for interpolated position
            var factor = this._elapsed / this.lengthMS;
            this.spriteComponent.frame = (factor * this.spriteComponent.meta.frames) | 0;
         }
         super.interpolateTick(elapsed);
      }
   }
}
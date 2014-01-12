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
/// <reference path="../../tile/components/animatedSpriteComponent.ts" />
/// <reference path="../../tile/components/spriteComponent.ts" />
/// <reference path="./playerComponent.ts" />
/// <reference path="../gameComponent.ts" />
/// <reference path="../objects/gameEntityObject.ts" />

module pow2 {
   // TODO: This
   export class SoundComponent extends SceneComponent {

   }

   /**
    * A component that defines the functionality of a map feature.
    */
   export class DamageComponent extends TileComponent {
      host:GameEntityObject;
      animation:AnimatedSpriteComponent;
      sprite:SpriteComponent;
      sound:SoundComponent;
      started:boolean = false;
      syncComponent():boolean {
         if(!super.syncComponent()){
            return false;
         }
         this.animation = <AnimatedSpriteComponent>this.host.findComponent(AnimatedSpriteComponent);
         this.sprite = <SpriteComponent>this.host.findComponent(SpriteComponent);
         this.sound = <SoundComponent>this.host.findComponent(SoundComponent);
         var ok = !!(this.animation && this.sprite);
         if(!this.started && ok){
            this.started = true;
            this.animation.once('anim:done',() => {
               this.trigger('damage:done');
            });
         }
         return ok;
      }
   }
}
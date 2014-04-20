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

/// <reference path="../tile/tileMapView.ts"/>
/// <reference path="./components/combatCameraComponent.ts"/>
/// <reference path="./components/playerCombatRenderComponent.ts"/>

module pow2{
   export class GameCombatView extends TileMapView {
      objectRenderer:TileObjectRenderer = new TileObjectRenderer;
      mouse:NamedMouseElement = null;

      constructor(canvas: HTMLCanvasElement, loader: any) {
         super(canvas,loader);
         this.mouseClick = _.bind(this.mouseClick,this);
      }
      onAddToScene(scene:Scene) {
         this.mouse = scene.world.input.mouseHook(this,"combat");
         this.$el.on('click',this.mouseClick);
      }
      onRemoveFromScene(scene:Scene) {
         scene.world.input.mouseUnhook("combat");
         this.$el.off('click',this.mouseClick);
      }


      /*
       * Mouse input
       */
      mouseClick() {
         //console.log("clicked at " + this.mouse.world);
         var hits = [];
         if(this.scene.db.queryPoint(this.mouse.world,GameEntityObject,hits)) {
            this.scene.trigger('click',this.mouse,hits);
         }
      }
      /*
       * Update the camera for this frame.
       */
      processCamera() {
         this.cameraComponent = <CameraComponent>this.scene.componentByType(CombatCameraComponent);
         super.processCamera();
      }

      /*
       * Render the tile map, and any features it has.
       */
      renderFrame(elapsed) {
         super.renderFrame(elapsed);

         var players = this.scene.objectsByComponent(pow2.combat.PlayerCombatRenderComponent);
         _.each(players, (player) => {
            this.objectRenderer.render(player,player,this);
         });

         var sprites = <ISceneComponent[]>this.scene.componentsByType(pow2.SpriteComponent);
         _.each(sprites, (sprite:SpriteComponent) => {
            this.objectRenderer.render(sprite.host,sprite, this);
         });
         return this;
      }
   }
}

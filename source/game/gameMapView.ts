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

/// <reference path="../../lib/pow2.d.ts" />
/// <reference path="../tile/tileMapView.ts"/>
/// <reference path="../tile/render/tileObjectRenderer.ts"/>
/// <reference path="./components/playerComponent.ts"/>
/// <reference path="./components/playerCameraComponent.ts"/>
/// <reference path="../tile/components/spriteComponent.ts"/>

module pow2{
   export class GameMapView extends TileMapView {
      objectRenderer:TileObjectRenderer = new TileObjectRenderer;
      tileMap:GameTileMap = null;
      mouse:NamedMouseElement = null;

      constructor(canvas: HTMLCanvasElement, loader: any) {
         super(canvas,loader);
         this.mouseClick = _.bind(this.mouseClick,this);
      }
      onAddToScene(scene:Scene) {
         this.mouse = scene.world.input.mouseHook(<SceneView>this,"world");
         // TODO: Move this elsewhere.
         this.$el.on('click touchstart',this.mouseClick);
         this.scene.on("map:loaded",this.syncComponents,this);
      }
      onRemoveFromScene(scene:Scene) {
         scene.world.input.mouseUnhook("world");
         this.$el.off('click',this.mouseClick);
         this.scene.off("map:loaded",this.syncComponents,this);
      }


      /*
       * Mouse input
       */
      mouseClick(e:any) {
         var party = <pow2.PlayerComponent>this.scene.componentByType(pow2.PlayerComponent);
         if (party) {
            Input.mouseOnView(e.originalEvent,this.mouse.view,this.mouse);
            party.path = this.tileMap.calculatePath(party.targetPoint,this.mouse.world);
            e.preventDefault();
            return false;
         }

      }
      /*
       * Update the camera for this frame.
       */
      processCamera() {
         this.cameraComponent = <CameraComponent>this.findComponent(CameraComponent);
         if(!this.cameraComponent){
            this.cameraComponent = <CameraComponent>this.scene.componentByType(PlayerCameraComponent);
         }
         super.processCamera();
      }

      private _features:pow2.GameFeatureObject[] = null;
      private _players:pow2.SceneObject[] = null;
      private _playerRenders:pow2.SceneObject[] = null;
      private _sprites:pow2.SpriteComponent[] = null;
      private _movers:pow2.MovableComponent[] = null;
      syncComponents() {
         super.syncComponents();
         this._features = null;
         this._players = null;
         this._playerRenders = null;
         this._sprites = null;
         this._movers = null;
      }

      /*
       * Render the tile map, and any features it has.
       */
      renderFrame(elapsed) {
         super.renderFrame(elapsed);
         if(!this._features) {
            this._features = <pow2.GameFeatureObject[]>this.scene.objectsByType(pow2.GameFeatureObject);
         }
         var l:number = this._features.length;
         for(var i = 0; i < l; i++){
            this.objectRenderer.render(this._features[i],this._features[i],this);
         }
         if(!this._playerRenders) {
            this._playerRenders = <pow2.SceneObject[]>this.scene.objectsByComponent(pow2.PlayerRenderComponent);
         }
         l = this._playerRenders.length;
         for(var i = 0; i < l; i++){
            var renderObj:any = this._playerRenders[i];
            this.objectRenderer.render(renderObj,renderObj,this);
         }
         if(!this._players){
            this._players = <pow2.SceneObject[]>this.scene.objectsByComponent(pow2.PlayerComponent);
         }
         l = this._players.length;
         for(var i = 0; i < l; i++){
            var renderObj:any = this._players[i];
            this.objectRenderer.render(renderObj,renderObj,this);
         }

         if(!this._sprites){
            this._sprites = <SpriteComponent[]>this.scene.componentsByType(pow2.SpriteComponent);
         }

         l = this._sprites.length;
         for(var i = 0; i < l; i++){
            var sprite = this._sprites[i];
            this.objectRenderer.render(sprite.host,sprite,this);
         }

         if(!this._movers){
            this._movers = <MovableComponent[]>this.scene.componentsByType(pow2.MovableComponent);
         }
         l = this._movers.length;
         for(var i = 0; i < l; i++){
            var target:MovableComponent = this._movers[i];
            if(target.path.length > 0){
               this.context.save();
               var destination:Point = target.path[target.path.length -1].clone();
               destination.x -= 0.5;
               destination.y -= 0.5;

               var screenTile = this.worldToScreen(new Rect(destination, new Point(1,1)));
               this.context.fillStyle = "rgba(10,255,10,0.3)";
               this.context.fillRect(screenTile.point.x,screenTile.point.y,screenTile.extent.x,screenTile.extent.y);
               this.context.strokeStyle = "rgba(10,255,10,0.9)";
               this.context.lineWidth = 1.5;
               this.context.strokeRect(screenTile.point.x,screenTile.point.y,screenTile.extent.x,screenTile.extent.y);

               this.context.restore();
            }
         }


         return this;
      }

      debugRender(debugStrings: string[] = []) {
         var party = this.scene.objectByComponent(pow2.PlayerComponent);
         if (party) {
            debugStrings.push("Party: (" + party.point.x + "," + party.point.y + ")");
         }
         if(this.mouse){
            var worldMouse:Point = this.screenToWorld(this.mouse.point,this.cameraScale).add(this.camera.point).round();
            debugStrings.push("Mouse: " + this.mouse.point + ", World: " + worldMouse);

            var tileRect:Rect = new Rect(worldMouse,new Point(1,1));
            var half = tileRect.getHalfSize();
            tileRect.point.x -= half.x;
            tileRect.point.y -= half.y;
            var screenTile = this.worldToScreen(tileRect,1);


            var results:TileObject[] = [];
            var hit = this.scene.db.queryRect(tileRect,SceneObject,results);
            if(hit){
               _.each(results,(obj:any) => {
                  debugStrings.push("Hit: " + obj);
               });
               this.context.fillStyle = "rgba(10,255,10,0.3)";
               this.context.fillRect(screenTile.point.x,screenTile.point.y,screenTile.extent.x,screenTile.extent.y);

            }

            this.context.strokeStyle = hit ? "rgba(10,255,10,0.9)" : "rgba(255,255,255,0.9)";
            this.context.lineWidth = 1.5;
            this.context.strokeRect(screenTile.point.x,screenTile.point.y,screenTile.extent.x,screenTile.extent.y);

         }
         super.debugRender(debugStrings);
      }
   }
}

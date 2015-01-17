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

/// <reference path="../../lib/pow2.d.ts" />
/// <reference path="./gameTileMap.ts"/>

module pow2{
   export class GameMapView extends TileMapView {
      objectRenderer:TileObjectRenderer = new TileObjectRenderer;
      tileMap:GameTileMap = null;
      mouse:NamedMouseElement = null;
      scene:Scene;

      /**
       * The fill color to use when rendering a path target.
       */
      targetFill:string = "rgba(10,255,10,0.3)";
      /**
       * The stroke to use when outlining path target.
       */
      targetStroke:string = "rgba(10,255,10,0.3)";
      /**
       * Line width for the path target stroke.
       */
      targetStrokeWidth:number = 1.5;

      constructor(canvas: HTMLCanvasElement, loader: any) {
         super(canvas,loader);
         this.mouseClick = _.bind(this.mouseClick,this);
      }
      onAddToScene(scene:Scene) {
         this.clearCache();
         super.onAddToScene(scene);
         this.mouse = scene.world.input.mouseHook(<SceneView>this,"world");
         // TODO: Move this elsewhere.
         this.$el.on('click touchstart',this.mouseClick);
         this.scene.on(pow2.TileMap.Events.MAP_LOADED,this.syncComponents,this);
      }
      onRemoveFromScene(scene:Scene) {
         this.clearCache();
         scene.world.input.mouseUnhook("world");
         this.$el.off('click',this.mouseClick);
         this.scene.off(pow2.TileMap.Events.MAP_LOADED,this.syncComponents,this);
      }


      /*
       * Mouse input
       */
      mouseClick(e:any) {
         var pathComponent = <pow2.tile.components.PathComponent>this.scene.componentByType(pow2.tile.components.PathComponent);
         var playerComponent = <pow2.game.components.PlayerComponent>this.scene.componentByType(pow2.game.components.PlayerComponent);
         if (pathComponent && playerComponent) {
            Input.mouseOnView(e.originalEvent,this.mouse.view,this.mouse);
            playerComponent.path = pathComponent.calculatePath(playerComponent.targetPoint,this.mouse.world);
            e.preventDefault();
            return false;
         }

      }

      private _features:pow2.GameFeatureObject[] = null;
      private _players:pow2.SceneObject[] = null;
      private _playerRenders:pow2.SceneObject[] = null;
      private _sprites:pow2.SpriteComponent[] = null;
      private _movers:pow2.MovableComponent[] = null;
      syncComponents() {
         super.syncComponents();
         this.clearCache();
      }

      private clearCache() {
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
            this._players = <pow2.SceneObject[]>this.scene.objectsByComponent(pow2.game.components.PlayerComponent);
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

               var screenTile:pow2.Rect = this.worldToScreen(new Rect(destination, new Point(1,1)));
               this.context.fillStyle = this.targetFill;
               this.context.fillRect(screenTile.point.x,screenTile.point.y,screenTile.extent.x,screenTile.extent.y);
               this.context.strokeStyle = this.targetStroke;
               this.context.lineWidth = this.targetStrokeWidth;
               this.context.strokeRect(screenTile.point.x,screenTile.point.y,screenTile.extent.x,screenTile.extent.y);

               this.context.restore();
            }
         }
         return this;
      }
   }
}

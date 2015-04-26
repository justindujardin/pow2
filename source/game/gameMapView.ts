/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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

/// <reference path="../tile/tileMapView.ts" />

module pow2.game {
  export class GameMapView extends pow2.tile.TileMapView {
    objectRenderer:pow2.tile.render.TileObjectRenderer = new pow2.tile.render.TileObjectRenderer;
    mouse:NamedMouseElement = null;
    scene:pow2.scene.Scene;

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

    constructor(canvas:HTMLCanvasElement, loader:any) {
      super(canvas, loader);
      this.mouseClick = _.bind(this.mouseClick, this);
    }

    onAddToScene(scene:pow2.scene.Scene) {
      this.clearCache();
      super.onAddToScene(scene);
      this.mouse = scene.world.input.mouseHook(<pow2.scene.SceneView>this, "world");
      // TODO: Move this elsewhere.
      this.$el.on('click touchstart', this.mouseClick);
      this.scene.on(pow2.tile.TileMap.Events.MAP_LOADED, this.syncComponents, this);
    }

    onRemoveFromScene(scene:pow2.scene.Scene) {
      this.clearCache();
      scene.world.input.mouseUnhook("world");
      this.$el.off('click', this.mouseClick);
      this.scene.off(pow2.tile.TileMap.Events.MAP_LOADED, this.syncComponents, this);
    }


    /*
     * Mouse input
     */
    mouseClick(e:any) {
      var pathComponent = <pow2.tile.components.PathComponent>this.scene.componentByType(pow2.tile.components.PathComponent);
      var playerComponent = <pow2.scene.components.PlayerComponent>this.scene.componentByType(pow2.scene.components.PlayerComponent);
      if (pathComponent && playerComponent) {
        Input.mouseOnView(e.originalEvent, this.mouse.view, this.mouse);
        playerComponent.path = pathComponent.calculatePath(playerComponent.targetPoint, this.mouse.world);
        e.preventDefault();
        return false;
      }
    }

    private _players:pow2.scene.SceneObject[] = null;
    private _playerRenders:pow2.scene.SceneObject[] = null;
    private _sprites:pow2.tile.components.SpriteComponent[] = null;
    private _movers:pow2.scene.components.MovableComponent[] = null;

    syncComponents() {
      super.syncComponents();
      this.clearCache();
    }

    protected _renderables:any[] = [];

    protected clearCache() {
      this._players = null;
      this._playerRenders = null;
      this._sprites = null;
      this._movers = null;
      this._renderables = [];
    }

    /*
     * Render the tile map, and any features it has.
     */
    renderFrame(elapsed) {
      super.renderFrame(elapsed);
      if (!this._playerRenders) {
        this._playerRenders = <pow2.scene.SceneObject[]>this.scene.objectsByComponent(pow2.game.components.PlayerRenderComponent);
        this._renderables = this._renderables.concat(this._playerRenders);
      }
      if (!this._players) {
        this._players = <pow2.scene.SceneObject[]>this.scene.objectsByComponent(pow2.scene.components.PlayerComponent);
        this._renderables = this._renderables.concat(this._players);
      }
      if (!this._sprites) {
        this._sprites = <pow2.tile.components.SpriteComponent[]>this.scene.componentsByType(pow2.tile.components.SpriteComponent);
        this._renderables = this._renderables.concat(this._sprites);
      }
      var l:number = this._renderables.length;
      for (var i = 0; i < l; i++) {
        var renderObj:any = this._renderables[i];
        this.objectRenderer.render(renderObj, renderObj, this);
      }
      if (!this._movers) {
        this._movers = <pow2.scene.components.MovableComponent[]>this.scene.componentsByType(pow2.scene.components.MovableComponent);
      }
      l = this._movers.length;
      for (var i = 0; i < l; i++) {
        var target:pow2.scene.components.MovableComponent = this._movers[i];
        if (target.path.length > 0) {
          this.context.save();
          var destination:Point = target.path[target.path.length - 1].clone();
          destination.x -= 0.5;
          destination.y -= 0.5;

          var screenTile:pow2.Rect = this.worldToScreen(new Rect(destination, new Point(1, 1)));
          this.context.fillStyle = this.targetFill;
          this.context.fillRect(screenTile.point.x, screenTile.point.y, screenTile.extent.x, screenTile.extent.y);
          this.context.strokeStyle = this.targetStroke;
          this.context.lineWidth = this.targetStrokeWidth;
          this.context.strokeRect(screenTile.point.x, screenTile.point.y, screenTile.extent.x, screenTile.extent.y);

          this.context.restore();
        }
      }
      return this;
    }
  }
}

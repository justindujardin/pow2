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

/// <reference path="./playerRenderComponent.ts" />

module pow2.scene.components {

  export class PlayerComponent extends pow2.scene.components.MovableComponent {
    host:pow2.tile.TileObject;
    passableKeys:string[] = ['passable'];
    // TODO: Pass in collide types during entity creation, and assert on invalid types.
    static COLLIDE_TYPES:string[] = [
      'rpg.components.features.TempleFeatureComponent',
      'rpg.components.features.StoreFeatureComponent',
      'rpg.components.features.DialogFeatureComponent',
      'sign'
    ];
    private _lastFrame:number = 3;
    private _renderFrame:number = 3;
    heading:Point = new Point(0, -1);
    sprite:pow2.game.components.PlayerRenderComponent = null;
    collideComponentType:any = pow2.tile.TileComponent;

    static Events:any = {
      MOVE_BEGIN: 'move:begin',
      MOVE_END: 'move:end'
    };

    syncComponent():boolean {
      this.sprite = <pow2.game.components.PlayerRenderComponent>
          this.host.findComponent(pow2.game.components.PlayerRenderComponent);
      return super.syncComponent();
    }

    tick(elapsed:number) {
      // There are four states and two rows.  The second row is all alt states, so mod it out
      // when a move ends.
      this._lastFrame = this._renderFrame > 3 ? this._renderFrame - 4 : this._renderFrame;
      super.tick(elapsed);
    }

    interpolateTick(elapsed:number) {
      super.interpolateTick(elapsed);
      if (!this.sprite) {
        return;
      }
      var xMove = this.targetPoint.x !== this.host.renderPoint.x;
      var yMove = this.targetPoint.y !== this.host.renderPoint.y;
      if (this.velocity.y > 0 && yMove) {
        this.sprite.setHeading(pow2.game.components.Headings.SOUTH, yMove);
        this.heading.set(0, 1);
      }
      else if (this.velocity.y < 0 && yMove) {
        this.sprite.setHeading(pow2.game.components.Headings.NORTH, yMove);
        this.heading.set(0, -1);
      }
      else if (this.velocity.x < 0 && xMove) {
        this.sprite.setHeading(pow2.game.components.Headings.WEST, xMove);
        this.heading.set(-1, 0);
      }
      else if (this.velocity.x > 0 && xMove) {
        this.sprite.setHeading(pow2.game.components.Headings.EAST, xMove);
        this.heading.set(1, 0);
      }
      else {
        if (this.velocity.y > 0) {
          this.sprite.setHeading(pow2.game.components.Headings.SOUTH, false);
          this.heading.set(0, 1);
        }
        else if (this.velocity.y < 0) {
          this.sprite.setHeading(pow2.game.components.Headings.NORTH, false);
          this.heading.set(0, -1);
        }
        else if (this.velocity.x < 0) {
          this.sprite.setHeading(pow2.game.components.Headings.WEST, false);
          this.heading.set(-1, 0);
        }
        else if (this.velocity.x > 0) {
          this.sprite.setHeading(pow2.game.components.Headings.EAST, false);
          this.heading.set(1, 0);
        }
        else {
          this.sprite.setMoving(false);
        }
      }
    }

    /**
     * Determine if a point on the map collides with a given terrain
     * attribute.  If the attribute is set to false, a collision occurs.
     *
     * @param at {pow2.Point} The point to check.
     * @param passableAttribute {string} The attribute to check.
     * @returns {boolean} True if the passable attribute was found and set to false.
     */
    collideWithMap(at:pow2.Point, passableAttribute:string):boolean {
      var map = <pow2.tile.TileMap>this.host.scene.objectByType(pow2.tile.TileMap);
      if (map) {
        var layers:tiled.ITiledLayer[] = map.getLayers();
        for (var i = 0; i < layers.length; i++) {
          var terrain = map.getTileData(layers[i], at.x, at.y);
          if (!terrain) {
            continue;
          }
          if (terrain[passableAttribute] === false) {
            return true;
          }
        }
      }
      return false;
    }

    collideMove(x:number, y:number, results:pow2.scene.SceneObject[] = []) {
      return false;
    }

    beginMove(move:pow2.scene.components.IMoveDescription) {
      this.host.trigger(PlayerComponent.Events.MOVE_BEGIN, this, move.from, move.to);
      if (!this.collider) {
        return;
      }

      var results = [];
      this.collider.collide(move.from.x, move.from.y, pow2.tile.TileObject, results);
      for (var i = 0; i < results.length; i++) {
        var o:pow2.tile.TileObject = results[i];
        var comp:pow2.tile.TileComponent = <pow2.tile.TileComponent>o.findComponent(this.collideComponentType);
        if (!comp || !comp.enter) {
          continue;
        }
        if (comp.exit(this.host) === false) {
          return;
        }
      }
      results.length = 0;
      this.collider.collide(move.to.x, move.to.y, pow2.tile.TileObject, results);
      for (var i = 0; i < results.length; i++) {
        var o:pow2.tile.TileObject = results[i];
        var comp = <pow2.tile.TileComponent>o.findComponent(this.collideComponentType);
        if (!comp || !comp.enter) {
          continue;
        }
        if (comp.enter(this.host) === false) {
          return;
        }
      }
    }

    completeMove(move:pow2.scene.components.IMoveDescription) {
      this.host.trigger(PlayerComponent.Events.MOVE_END, this, move.from, move.to);
      if (!this.collider) {
        return;
      }

      // Trigger exit on previous components
      var hits:pow2.tile.TileObject[] = [];
      this.collider.collide(move.from.x, move.from.y, pow2.tile.TileObject, hits);
      var fromObject:pow2.tile.TileObject = _.find(hits, (o:pow2.tile.TileObject)=> {
        return o._uid !== this.host._uid;
      });
      if (fromObject) {
        var comp = <pow2.tile.TileComponent>fromObject.findComponent(this.collideComponentType);
        if (comp && comp.host._uid !== this.host._uid) {
          comp.exited(this.host);
        }
      }

      // Trigger enter on new components
      hits.length = 0;
      this.collider.collide(move.to.x, move.to.y, pow2.tile.TileObject, hits);
      var toObject:pow2.tile.TileObject = _.find(hits, (o:pow2.tile.TileObject)=> {
        return o._uid !== this.host._uid;
      });
      if (toObject) {
        var comp = <pow2.tile.TileComponent>toObject.findComponent(this.collideComponentType);
        if (comp && comp.host._uid !== this.host._uid) {
          comp.entered(this.host);
        }
      }

    }
  }
}
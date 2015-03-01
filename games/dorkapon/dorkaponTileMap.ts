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

/// <reference path="./dorkaponGameWorld.ts" />

module dorkapon {

  /**
   * These are currently hardcoded to specific tile set GID numbers that
   * correspond to the various connector graphics used to represent horizontal
   * and vertical paths.
   *
   * These specific textures are used to dynamically build paths between nodes.
   */
  export enum PathTiles {
    HORIZ_LEFT = 25,
    HORIZ_CENTER = 26,
    HORIZ_RIGHT = 27,
    VERT_TOP = 34,
    VERT_MIDDLE = 35,
    VERT_BOTTOM = 36
  }

  /**
   * These are hardcoded to specific tile set GID numbers that correspond to
   * the various types of nodes a player may land on.
   *
   * These specific textures are used to indicate metadata about the tile.
   */
  export enum NodeTiles {
    YELLOW = 54,
    ARMOR = 58,
    WEAPON = 59,
    ITEM = 60,
    RED = 63,
    BLUE = 72,
    GREEN = 71
  }

  /**
   * Enumerated path weights for use in input grid creation.
   */
  export enum PathWeights {
    CAN_REST = 10,
    CAN_WALK = 5,
    BLOCKED = 1000
  }

  /**
   * Describe where in the map a node tile exists, and what type it is.
   */
  export interface INodeTile extends pow2.IPoint {
    type:NodeTiles;
    _object:objects.DorkaponEntity;
  }

  /**
   * Describe where in the map a path tile exists, and what type it is.
   */
  export interface IPathTile extends pow2.IPoint {
    type:PathTiles;
    _object:objects.DorkaponEntity;
  }


  export class DorkaponTileMap extends pow2.tile.TileMap {

    static Layers:any = {
      NODES: "nodes",
      HORIZONTAL_PATHS: "paths-horizontal",
      VERTICAL_PATHS: "paths-vertical"
    };

    world:DorkaponGameWorld;

    loaded() {
      super.loaded();
      this.buildFeatures();
    }

    destroy() {
      this.unloaded();
      return super.destroy();
    }

    unloaded() {
      this.removeFeaturesFromScene();
      super.unloaded();
    }

    addFeaturesToScene() {
      var nodes = this.getNodes();
      _.each(nodes, (obj:INodeTile) => {
        obj._object = this.createFeatureObject(obj);
        if (obj._object) {
          this.scene.addObject(obj._object);
        }
      });
    }

    removeFeaturesFromScene() {
      var nodes = this.getNodes();
      _.each(nodes, (obj:any) => {
        var featureObject:objects.DorkaponEntity = obj._object;
        delete obj._object;
        if (featureObject) {
          featureObject.destroy();
        }
      });
    }

    buildFeatures():boolean {
      this.removeFeaturesFromScene();
      if (this.scene) {
        this.addFeaturesToScene();
      }
      return true;
    }

    createFeatureObject(node:INodeTile):objects.DorkaponEntity {
      var options = {
        tileMap: this,
        type: node.type,
        point: new pow2.Point(node.x, node.y)
      };
      var object = new objects.DorkaponEntity(options);
      this.world.mark(object);

      var className:string = null;
      switch (node.type) {
        case NodeTiles.ARMOR:
          className = "dorkapon.components.tiles.ArmorTile";
          break;
        case NodeTiles.WEAPON:
          className = "dorkapon.components.tiles.WeaponTile";
          break;
        case NodeTiles.ITEM:
          className = "dorkapon.components.tiles.ItemTile";
          break;
        case NodeTiles.BLUE:
          className = "dorkapon.components.tiles.BlueTile";
          break;
        case NodeTiles.YELLOW:
          className = "dorkapon.components.tiles.YellowTile";
          break;
        case NodeTiles.RED:
          className = "dorkapon.components.tiles.RedTile";
          break;
        case NodeTiles.GREEN:
          className = "dorkapon.components.tiles.GreenTile";
          break;
      }

      var componentType:any = pow2.EntityContainerResource.getClassType(className);
      if (componentType) {
        var component = <pow2.ISceneComponent>(new componentType());
        if (!object.addComponent(component)) {
          throw new Error("Component " + component.name + " failed to connect to host " + this.name);
        }
      }
      return object;
    }


    /**
     * Get a list of INodeTile objects that exist in the tile map.
     */
    getNodes():INodeTile[] {
      var nodes = this.getLayer(DorkaponTileMap.Layers.NODES);
      if (!nodes) {
        return [];
      }

      // Build a list of INodeTile objects.
      var mapWidth:number = this.bounds.extent.x;
      var asNodeTile = <INodeTile[]>_.map(nodes.data, (gid:number, index:number)=> {
        switch (gid) {
          case NodeTiles.ARMOR:
          case NodeTiles.WEAPON:
          case NodeTiles.ITEM:
          case NodeTiles.RED:
          case NodeTiles.GREEN:
          case NodeTiles.BLUE:
          case NodeTiles.YELLOW:
            var x:number = index % mapWidth;
            var y:number = (index - x) / mapWidth;
            return {
              type: gid,
              x: x,
              y: y,
              _object: null
            };
          default:
            // We don't care about this tile, it doesn't match a known NodeTile id.
            return null;
        }
      });

      // Compact the list to remove null entries, and return a
      // list of just the nodes and their locations.
      return _.compact(asNodeTile);
    }

    getHorizPaths():IPathTile[] {
      var nodes = this.getLayer(DorkaponTileMap.Layers.HORIZONTAL_PATHS);
      if (!nodes) {
        return [];
      }

      // Build a list of INodeTile objects.
      var mapWidth:number = this.bounds.extent.x;
      var paths = <IPathTile[]>_.map(nodes.data, (gid:number, index:number)=> {
        switch (gid) {
          case PathTiles.HORIZ_LEFT:
          case PathTiles.HORIZ_CENTER:
          case PathTiles.HORIZ_RIGHT:
            var x:number = index % mapWidth;
            var y:number = (index - x) / mapWidth;
            return {
              type: gid,
              x: x,
              y: y
            };
          default:
            // We don't care about this tile, it doesn't match a known PathTile id.
            return null;
        }
      });
      // Compact the list to remove null entries, and return a
      // list of just the nodes and their locations.
      return _.compact(paths);
    }

    getVertPaths():IPathTile[] {
      var nodes = this.getLayer(DorkaponTileMap.Layers.VERTICAL_PATHS);
      if (!nodes) {
        return [];
      }

      // Build a list of INodeTile objects.
      var mapWidth:number = this.bounds.extent.x;
      var paths = <IPathTile[]>_.map(nodes.data, (gid:number, index:number)=> {
        switch (gid) {
          case PathTiles.VERT_TOP:
          case PathTiles.VERT_MIDDLE:
          case PathTiles.VERT_BOTTOM:
            var x:number = index % mapWidth;
            var y:number = (index - x) / mapWidth;
            return {
              type: gid,
              x: x,
              y: y
            };
          default:
            // We don't care about this tile, it doesn't match a known PathTile id.
            return null;
        }
      });
      // Compact the list to remove null entries, and return a
      // list of just the nodes and their locations.
      return _.compact(paths);
    }


  }
}
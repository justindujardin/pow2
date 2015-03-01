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

/// <reference path="../scene/sceneObject.ts" />

module pow2.tile {

  // TODO: TileMap isn't getting added to Spatial DB properly.  Can't query for it!
  // Scene assuming something about the spatial properties on objects?

  export class TileMap extends pow2.scene.SceneObject {
    map:TiledTMXResource;
    tiles:any = []; // TODO: TilesetProperties
    scene:pow2.scene.Scene;
    features:any;
    zones:any;
    bounds:pow2.Rect;
    dirtyLayers:boolean = false;
    private _loaded:boolean = false;

    static Events:any = {
      LOADED: "loaded",
      UNLOADED: "unloaded",
      MAP_LOADED: "map:loaded",
      MAP_UNLOADED: "map:unloaded"
    };

    constructor(map:pow2.TiledTMXResource) {
      super();
      this.bounds = new pow2.Rect(0, 0, 10, 10);
      this.setMap(map);
    }

    isLoaded():boolean {
      return this._loaded;
    }

    loaded() {
      this.trigger(pow2.tile.TileMap.Events.LOADED, this);
      if (this.scene) {
        this.scene.trigger(pow2.tile.TileMap.Events.MAP_LOADED, this);
      }
      this._loaded = true;
    }

    unloaded() {
      this.trigger(pow2.tile.TileMap.Events.UNLOADED, this);
      if (this.scene) {
        this.scene.trigger(pow2.tile.TileMap.Events.MAP_UNLOADED, this);
      }
      this._loaded = false;
    }

    setMap(map:TiledTMXResource) {
      if (!map || !map.isReady()) {
        return false;
      }
      if (this.map) {
        this.unloaded();
      }
      this.map = map;
      this.bounds = new pow2.Rect(0, 0, this.map.width, this.map.height);
      var idSortedSets = _.sortBy(this.map.tilesets, (o:TiledTSXResource) => {
        return o.firstgid;
      });
      this.tiles.length = 0;
      _.each(idSortedSets, (tiles:TiledTSXResource) => {
        while (this.tiles.length < tiles.firstgid) {
          this.tiles.push(null);
        }
        this.tiles = this.tiles.concat(tiles.tiles);
      });
      this.features = _.where(this.map.layers, {name: "Features"})[0] || [];
      this.zones = _.where(this.map.layers, {name: "Zones"})[0] || [];
      this.loaded();
      return true;
    }

    getLayers():tiled.ITiledLayer[] {
      return this.map ? this.map.layers : [];
    }

    getLayer(name:string):tiled.ITiledLayer {
      return <tiled.ITiledLayer>_.where(this.map.layers, {name: name})[0];
    }

    getTerrain(layer:string, x:number, y:number) {
      return this.getTileData(this.getLayer(layer), x, y);
    }

    getTileData(layer:tiled.ITiledLayer, x:number, y:number) {
      if (!this.map || !layer || !layer.data || !this.bounds.pointInRect(x, y)) {
        return null;
      }
      var terrainIndex = y * this.map.width + x;
      var tileIndex = layer.data[terrainIndex];
      return this.tiles[tileIndex];
    }

    getTileGid(layer:string, x:number, y:number):number {
      var terrain:tiled.ITiledLayer = this.getLayer(layer);
      if (!this.map || !terrain || !terrain.data || !this.bounds.pointInRect(x, y)) {
        return null;
      }
      var terrainIndex = y * this.map.width + x;
      return terrain.data[terrainIndex];
    }

    getTileMeta(gid:number):pow2.tiled.ITileInstanceMeta {
      if (this.tiles.length <= gid) {
        return null;
      }
      var source = _.find(this.map.tilesets, (t:TiledTSXResource) => {
        return t.hasGid(gid);
      });
      if (!source) {
        return null;
      }
      return source.getTileMeta(gid);
    }
  }
}
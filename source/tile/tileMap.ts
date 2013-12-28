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

/// <reference path="../../types/underscore/underscore.d.ts" />
/// <reference path="../core/point.ts" />
/// <reference path="../core/rect.ts" />
/// <reference path="../core/resources/json.ts" />
/// <reference path="../scene/sceneObject.ts" />
/// <reference path="./tileObject.ts" />
/// <reference path="./tiledMap.ts" />

module pow2 {
   export class TileMap extends SceneObject {
      resource: JSONResource;
      map: tiled.TiledMap;
      tileSet:any; // TODO: Tileset
      tiles:any; // TODO: TilesetProperties
      terrain:tiled.TileLayer;
      features:tiled.FeaturesLayer;
      mapName: string;
      bounds: pow2.Rect;

      constructor(mapName: string) {
         super();
         this.bounds = new pow2.Rect(0, 0, 10,10);
         this.mapName = mapName;
      }

      //
      // Scene Object Lifetime
      //
      onAddToScene(scene) {
         this.load();
      }

      load(mapName:string=this.mapName){
         this.world.loader.load("/maps/" + mapName + ".json", (mapResource:JSONResource) => {
            this.mapName = mapName;
            this.setMap(mapResource);
         });
      }

      loaded(){
         this.scene.trigger("map:loaded",this);
      }

      unloaded(){
         this.scene.trigger("map:unloaded",this);
      }

      setMap(map:JSONResource) {
         if (!map || !map.isReady()) {
            return false;
         }
         if(this.map){
            this.unloaded();
         }
         this.resource = map;
         this.map = new tiled.TiledMap(map.data);
         this.bounds = new pow2.Rect(0, 0, this.map.width, this.map.height);
         this.terrain = _.where(this.map.layers,{name:"Terrain"})[0];
         if(!this.terrain){
            throw new Error("Terrain layer must be present");
         }
         this.features = _.where(this.map.layers,{name:"Features"})[0];
         if(!this.features){
            throw new Error("Features object group must be present");
         }
         this.tileSet = _.where(this.map.tilesets,{name:"Environment"})[0];
         if(!this.tileSet){
            throw new Error("Environment tile set must be present");
         }
         this.tiles = this.tileSet.tileproperties;
         if(!this.tiles){
            throw new Error("Environment tileset must have properties for tile types");
         }
         this.loaded();
         return true;
      }

      getTerrain(x, y) {
         if (!this.map || !this.tiles || !this.bounds.pointInRect(x, y)) {
            return null;
         }
         var terrainIndex = y * this.map.width + x;
         var tileIndex = this.terrain.data[terrainIndex];
         return this.tiles[tileIndex];
      }

      // TODO: Calculate texture with two array index lookups like in getTerrain.  No need for FN call here.
      getTerrainTexture(x, y) {
         var terrain = this.getTerrain(x, y);
         if (terrain) {
            return terrain.icon;
         } else {
            return null;
         }
      }
   }
}
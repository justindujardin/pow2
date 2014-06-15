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
/// <reference path="../../lib/pow2.d.ts"/>
/// <reference path="./tileObject.ts" />
/// <reference path="./components/tileMapCameraComponent.ts" />
/// <reference path="./resources/tiled.ts" />
/// <reference path="./resources/tiledTmx.ts" />
/// <reference path="./resources/tiledTsx.ts" />

module pow2 {

   // TODO: TileMap isn't getting added to Spatial DB properly.  Can't query for it!
   // Scene assuming something about the spatial properties on objects?

   export class TileMap extends SceneObject {
      map: TiledTMXResource;
//      tileSet:any; // TODO: Tileset
      tiles:any = []; // TODO: TilesetProperties
//      terrain:any;
      features:any;
      zones:any;
      mapName: string;
      bounds: pow2.Rect;
      dirtyLayers:boolean = false;
      private _loaded:boolean = false;

      constructor(mapName: string) {
         super();
         this.bounds = new pow2.Rect(0, 0, 10,10);
         this.mapName = mapName;
      }

      //
      // Scene Object Lifetime
      //
      onAddToScene(scene) {
         // If there is no camera, create a basic one.
         if(!this.findComponent(CameraComponent)){
            this.addComponent(new TileMapCameraComponent());
         }
         this.load();
      }

      load(mapName:string=this.mapName){
         var loader:pow2.ResourceLoader = pow2.ResourceLoader.get();
         loader.ensureType('tmx',TiledTMXResource);
         loader.ensureType('tsx',TiledTSXResource);
         loader.load("/maps/" + mapName + ".tmx", (mapResource:TiledTMXResource) => {
            this.mapName = mapName;
            this.setMap(mapResource);
         });
      }

      isLoaded():boolean {
         return this._loaded;
      }

      loaded(){
         this.trigger('loaded',this);
         this.scene.trigger("map:loaded",this);
         this._loaded = true;
      }

      unloaded(){
         this.trigger('unloaded',this);
         this.scene.trigger("map:unloaded",this);
         this._loaded = false;
      }

      setMap(map:TiledTMXResource) {
         if (!map || !map.isReady()) {
            return false;
         }
         if(this.map){
            this.unloaded();
         }
         this.map = map;
         this.bounds = new pow2.Rect(0, 0, this.map.width, this.map.height);
         var idSortedSets = _.sortBy(this.map.tilesets, (o:TiledTSXResource) => {
            return o.firstgid;
         });
         this.tiles.length = 0;
         _.each(idSortedSets,(tiles:TiledTSXResource) => {
            while(this.tiles.length < tiles.firstgid){
               this.tiles.push(null);
            }
            this.tiles = this.tiles.concat(tiles.tiles);
         });
         this.features = _.where(this.map.objectGroups,{name:"Features"})[0] || [];
         this.zones = _.where(this.map.objectGroups,{name:"Zones"})[0] || [];
         this.loaded();
         return true;
      }

      getLayers():tiled.ITiledLayer[] {
         return this.map ? this.map.layers : [];
      }

      getLayer(name:string):tiled.ITiledLayer{
         return <tiled.ITiledLayer>_.where(this.map.layers,{name:name})[0];
      }

      getTerrain(layer:string, x:number, y:number) {
         var terrain:tiled.ITiledLayer = this.getLayer(layer);
         if (!this.map || !terrain || !this.bounds.pointInRect(x, y)) {
            return null;
         }
         var terrainIndex = y * this.map.width + x;
         var tileIndex = terrain.data[terrainIndex];
         return this.tiles[tileIndex];
      }

      getTileGid(layer:string, x:number, y:number):number {
         var terrain:tiled.ITiledLayer = this.getLayer(layer);
         if (!this.map || !terrain || !this.bounds.pointInRect(x, y)) {
            return null;
         }
         var terrainIndex = y * this.map.width + x;
         return terrain.data[terrainIndex];
      }

      getTileMeta(gid:number):ITileMeta {
         if(this.tiles.length <= gid){
            return null;
         }
         var source = _.find(this.map.tilesets,(t:TiledTSXResource) => {
            return t.hasGid(gid);
         });
         if(!source){
            return null;
         }
         return source.getTileMeta(gid);
      }

      // TODO: Calculate texture with two array index lookups like in getTerrain.  No need for FN call here.
      getTerrainTexture(x, y) {
         var terrain = this.getTerrain("Terrain", x, y);
         if (terrain) {
            return terrain.icon;
         } else {
            return null;
         }
      }
   }
}
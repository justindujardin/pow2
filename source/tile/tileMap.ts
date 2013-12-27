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
/// <reference path="./objects/tileFeatureObject.ts" />
/// <reference path="./components/tileDialogComponent.ts" />
/// <reference path="./components/tilePortalComponent.ts" />
/// <reference path="./components/tileShipComponent.ts" />
/// <reference path="./components/tileStoreComponent.ts" />

module eburp {
   export class TileMap extends eburp.SceneObject {
      resource: JSONResource;
      map: tiled.TiledMap;
      tileSet:any; // TODO: Tileset
      tiles:any; // TODO: TilesetProperties
      terrain:tiled.TileLayer;
      features:tiled.FeaturesLayer;
      featureHash:any = {};
      mapName: string;
      bounds: eburp.Rect;



      constructor(mapName: string) {
         super();
         this.bounds = new eburp.Rect(0, 0, 10,10);
         this.mapName = mapName;
      }

      //
      // Scene Object Lifetime
      //
      onAddToScene(scene) {
         this.load();
      }

      onRemoveFromScene(scene) {
         return this.removeFeaturesFromScene();
      }

      load(mapName:string=this.mapName){
         this.world.loader.load("/maps/" + mapName + ".json", (mapResource:JSONResource) => {
            this.mapName = mapName;
            this.setMap(mapResource);
         });
      }

      // TODO jd:  Composition for this is weird.  Seems like creating specific objects for this might be better.
      // Yes?
      getObjectForFeature(feature):TileObject {
         var options = _.extend({}, feature, {
            tileMap: this
         });
         var object = new TileFeatureObject(options);
         switch(feature.type){
            case 'transition':
               object.addComponent(new TilePortalComponent(object));
               break;
            case 'ship':
               object.addComponent(new TileShipComponent(object));
               break;
            case 'sign':
               if(feature.action === 'TALK'){
                  object.addComponent(new TileDialogComponent(object));
               }
               break;
            case 'store':
               object.addComponent(new TileStoreComponent(object));
               break;
         }
         return object;
      }

      // Construct
      addFeaturesToScene() {
         _.each(this.features.objects,(obj) => {
            obj._object = this.getObjectForFeature(obj.properties);
            this.scene.addObject(obj._object);
         });
      }

      removeFeaturesFromScene() {
         _.each(this.features.objects,(obj) => {
            var featureObject:SceneObject = <SceneObject>obj._object;
            if(featureObject){
               featureObject.destroy();
               delete obj._object;
            }
         });
      }


      buildFeatures():boolean {
         this.removeFeaturesFromScene();
         _.each(this.features.objects,(obj) => {
            var key = this.featureKey(obj.x, obj.y);
            var object = this.featureHash[key];
            if (!object) {
               object = this.featureHash[key] = {};
            }
            object[obj.type] = obj.properties;
         });
         if (this.scene) {
            this.addFeaturesToScene();
         }
         return true;
      }

      setMap(map:JSONResource) {
         if (!map || !map.isReady()) {
            return false;
         }
         if(this.map){
            this.scene.trigger("map:unloaded",this);
            this.removeFeaturesFromScene();
         }
         this.resource = map;
         this.map = new tiled.TiledMap(map.data);
         this.bounds = new eburp.Rect(0, 0, this.map.width, this.map.height);
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
         this.buildFeatures();
         this.scene.trigger("map:loaded",this);
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

      getTerrainIcon(x, y) {
         var terrain = this.getTerrain(x, y);
         if (terrain) {
            return terrain.icon;
         } else {
            return null;
         }
      }

      featureKey(x, y) {
         return "" + x + "_" + y;
      }


      getFeature(x, y) {
         if (!this.featureHash) {
            return {};
         }
         return this.featureHash[this.featureKey(x, y)];
      }

      getFeatures() {
         return this.featureHash;
      }
   }
}
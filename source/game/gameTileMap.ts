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

/// <reference path="../tile/tileMap.ts" />
/// <reference path="./components/gameDialogComponent.ts" />
/// <reference path="./components/gamePortalComponent.ts" />
/// <reference path="./components/gameShipComponent.ts" />
/// <reference path="./components/gameStoreComponent.ts" />

module pow2 {
   export class GameTileMap extends TileMap {
      featureHash:any = {};
      loaded(){
         super.loaded();
         this.buildFeatures();
      }
      unloaded(){
         this.removeFeaturesFromScene();
         super.unloaded();
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

      // Construct
      addFeaturesToScene() {
         _.each(this.features.objects,(obj:any) => {
            obj._object = this.getObjectForFeature(obj);
            this.scene.addObject(obj._object);
         });
      }

      removeFeaturesFromScene() {
         _.each(this.features.objects,(obj:any) => {
            var featureObject:SceneObject = <SceneObject>obj._object;
            if(featureObject){
               featureObject.destroy();
               delete obj._object;
            }
         });
      }


      buildFeatures():boolean {
         this.removeFeaturesFromScene();
         _.each(this.features.objects,(obj:any) => {
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

      // TODO jd:  Composition for this is weird.  Seems like creating specific objects for this might be better.
      // Yes?
      getObjectForFeature(tiledObject):TileObject {
         var feature = tiledObject.properties;
         var options = _.extend({}, feature, {
            tileMap: this,
            x: Math.round(tiledObject.x / this.map.tilewidth),
            y: Math.round(tiledObject.y / this.map.tileheight)
         });
         var object = new GameFeatureObject(options);
         var componentType:any = null;
         switch(feature.type){
            case 'transition':
               componentType = GamePortalComponent;
               break;
            case 'ship':
               componentType = GameShipComponent;
               break;
            case 'store':
               componentType = GameStoreComponent;
               break;
            default:
               if(feature.action === 'TALK'){
                  componentType = GameDialogComponent;
               }
               break;

         }

         if(componentType !== null){
            object.addComponent(<ISceneComponent>(new componentType()));
         }
         return object;
      }

   }
}
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
            obj._object = this.getObjectForFeature(obj.properties);
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
      getObjectForFeature(feature):TileObject {
         var options = _.extend({}, feature, {
            tileMap: this
         });
         var object = new GameFeatureObject(options);
         switch(feature.type){
            case 'transition':
               object.addComponent(new GamePortalComponent(object));
               break;
            case 'ship':
               object.addComponent(new GameShipComponent(object));
               break;
            case 'sign':
               if(feature.action === 'TALK'){
                  object.addComponent(new GameDialogComponent(object));
               }
               break;
            case 'store':
               object.addComponent(new GameStoreComponent(object));
               break;
         }
         return object;
      }

   }
}
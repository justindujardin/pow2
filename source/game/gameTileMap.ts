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
/// <reference path="../tile/resources/tiled.ts" />
/// <reference path="./components/features/dialogFeatureComponent.ts" />
/// <reference path="./components/features/combatFeatureComponent.ts" />
/// <reference path="./components/features/portalFeatureComponent.ts" />
/// <reference path="./components/features/shipFeatureComponent.ts" />
/// <reference path="./components/features/storeFeatureComponent.ts" />
/// <reference path="./components/features/templeFeatureComponent.ts" />

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
      getFeature(name:string){
         return _.find(<any>this.features.objects,(feature:any) => {
            return feature.name === name;
         });
      }
      addFeature(feature:any){
         feature._object = this.createFeatureObject(feature);
         this.scene.addObject(feature._object);
         this.indexFeature(feature._object);
      }

      indexFeature(obj:GameFeatureObject){
         var key = this.featureKey(obj.point.x, obj.point.y);
         var object = this.featureHash[key];
         if (!object) {
            object = this.featureHash[key] = {};
         }
         object[obj.type] = obj.feature.properties;
      }

      // Construct
      addFeaturesToScene() {
         _.each(this.features.objects,(obj:any) => {
            obj._object = this.createFeatureObject(obj);
            this.scene.addObject(obj._object);
         });
      }
      removeFeaturesFromScene() {
         _.each(this.features.objects,(obj:any) => {
            var featureObject:SceneObject = <SceneObject>obj._object;
            delete obj._object;
            if(featureObject){
               featureObject.destroy();
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
      createFeatureObject(tiledObject:tiled.ITiledObject):TileObject {
         var feature = tiledObject.properties;
         var options = _.extend({}, feature, {
            tileMap: this,
            x: Math.round(tiledObject.x / this.map.tilewidth),
            y: Math.round(tiledObject.y / this.map.tileheight)
         });
         var object = new GameFeatureObject(options);
         var componentType:any = null;
         var type:string = (feature && feature.type) ? feature.type : tiledObject.type;
         switch(type){
            case 'transition':
               componentType = PortalFeatureComponent;
               break;
            case 'ship':
               componentType = ShipFeatureComponent;
               break;
            case 'store':
               componentType = StoreFeatureComponent;
               break;
            case 'encounter':
               componentType = CombatFeatureComponent;
               break;
            case 'temple':
               componentType = TempleFeatureComponent;
               break;
            default:
               if(feature && feature.action === 'TALK'){
                  componentType = DialogFeatureComponent;
               }
               break;
         }
         if(componentType !== null){
            var component = <ISceneComponent>(new componentType());
            if(!object.addComponent(component)){
               throw new Error("Component " + component.name + " failed to connect to host " + this.name);
            }
         }
         return object;
      }

   }
}
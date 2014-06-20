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
/// <reference path="../../lib/pow2.d.ts" />

module pow2 {
   declare var astar:any;
   declare var Graph:any;

   /**
    * Describe a set of combat zones for a given point on a map.
    */
   export interface IZoneMatch {
      // The zone name for the current map
      map:string;
      // The zone name for the target location on the map
      target:string;
   }

   export class GameTileMap extends TileMap {
      featureHash:any = {};
      graph:any;
      loaded(){
         super.loaded();
         this.buildAStarGraph();
         this.addComponent(new GameFeatureInputComponent());

         // If there are map properties, take them into account.
         if(this.map.properties){
            var props = this.map.properties;
            // Does this map have random encounters?
            if(props.combat === true){
               this.addComponent(new CombatEncounterComponent());
            }
            // Does it have a music track?
            if(typeof props.music === 'string'){
               this.addComponent(new SoundComponent({
                  url:<string>props.music,
                  volume:0.5,
                  loop:true
               }));
            }
         }

         this.buildFeatures();
      }

      destroy(){
         this.unloaded();
         return super.destroy();
      }

      unloaded(){
         this.removeComponentByType(GameFeatureInputComponent);
         this.removeComponentByType(CombatEncounterComponent);
         this.removeComponentByType(SoundComponent);
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
         this.world.mark(object);
         var componentType:any = null;
         var type:string = (feature && feature.type) ? feature.type : tiledObject.type;
         switch(type){
            case 'transition':
               componentType = PortalFeatureComponent;
               break;
            case 'treasure':
               componentType = TreasureFeatureComponent;
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

      // Path Finding (astar.js)
      buildAStarGraph() {
         var grid = new Array(this.bounds.extent.x);
         for(var x:number = 0; x < this.bounds.extent.x; x++){
            grid[x] = new Array(this.bounds.extent.y);
         }
         for(var x:number = 0; x < this.bounds.extent.x; x++){
            for(var y:number = 0; y < this.bounds.extent.y; y++){
               var tile = this.getTerrain("Terrain",x,y);
               grid[x][y] = (tile && tile.passable) ? 10 : 1000;
               // Prefer tiles that are paths over just passable ones
               if(tile && tile.isPath){
                  grid[x][y] = 1;
               }
            }
         }

         // TOOD: Tiled Editor format is KILLIN' me.
         _.each(this.features.objects,(o:any) => {
            var obj:any = o.properties;
            if(!obj){
               return;
            }
            var collideTypes:string[] = ['temple','store','sign'];
            if(obj.passable === true || !obj.type){
               return;
            }
            if(_.indexOf(collideTypes, obj.type.toLowerCase()) !== -1){
               var x:number = o.x / o.width | 0;
               var y:number = o.y / o.height | 0;
               if(!obj.passable && this.bounds.pointInRect(x,y)){
                  grid[x][y] = 100;
               }
            }
         });
         this.graph = new Graph(grid);
      }

      calculatePath(from:Point,to:Point):Point[]{
         if(!this.graph || !this.graph.nodes){
            return [];
         }
         // Treat out of range errors as non-critical, and just
         // return an empty array.
         if(from.x >= this.graph.nodes.length || from.x < 0){
            return [];
         }
         if(from.y >= this.graph.nodes[from.x].length){
            return [];
         }
         if(to.x >= this.graph.nodes.length || to.x < 0){
            return [];
         }
         if(to.y >= this.graph.nodes[to.x].length){
            return [];
         }
         var start = this.graph.nodes[from.x][from.y];
         var end = this.graph.nodes[to.x][to.y];
         var result = astar.search(this.graph.nodes, start, end);
         return _.map(result,(graphNode:any) => {
            return new Point(graphNode.pos.x,graphNode.pos.y);
         });
      }

      /**
       * Enumerate the map and target combat zones for a given position on this map.
       * @param at The position to check for a sub-zone in the map
       * @returns {IZoneMatch} The map and target zones that are null if they don't exist
       */
      getCombatZones(at:pow2.Point):IZoneMatch {
         var result:IZoneMatch = {
            map:null,
            target:null
         };
         if(this.map && this.map.properties && this.map.properties){
            if(typeof this.map.properties.combatZone !== 'undefined'){
               result.map = this.map.properties.combatZone
            }
         }
         // Determine which zone and combat type
         var invTileSize = 1 / this.map.tilewidth;
         var zones:any[] = _.map(this.zones.objects,(z:any)=>{
            var x =  z.x * invTileSize;
            var y =  z.y * invTileSize;
            var w =  z.width * invTileSize;
            var h =  z.height * invTileSize;
            return {
               bounds:new Rect(x,y,w,h),
               name:z.name
            }
         });
         // TODO: This will always get the first zone.  What about overlapping zones?
         var zone = _.find(zones,(z:any)=>{
            return z.bounds.pointInRect(at) && z.name;
         });
         if(zone){
            result.target = zone.name;
         }
         return result;
      }

   }
}
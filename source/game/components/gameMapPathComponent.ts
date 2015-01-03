/*
 Copyright (C) 2013-2014 by Justin DuJardin and Contributors

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

/// <reference path="../../../lib/pow2.d.ts" />
/// <reference path="../objects/gameEntityObject.ts" />

module pow2.components {
   declare var astar:any;
   declare var Graph:any;

   /**
    * A component that can calculate A-star paths.
    */
   export class GameMapPathComponent extends GameComponent {

      private _graph:any; // Astar graph object
      
      constructor(public tileMap:GameTileMap) {
         super();
      }

      connectComponent():boolean {
         return super.connectComponent() && !!this.tileMap;
      }

      syncComponent():boolean {
         this.tileMap.off(pow2.TileMap.Events.UNLOADED,this.buildAStarGraph,this);
         this.tileMap.off(pow2.TileMap.Events.LOADED,this.buildAStarGraph,this);
         this.tileMap.on(pow2.TileMap.Events.LOADED,this.buildAStarGraph,this);
         this.tileMap.on(pow2.TileMap.Events.UNLOADED,this.buildAStarGraph,this);
         return super.syncComponent();
      }
      disconnectComponent():boolean {
            this.tileMap.off(pow2.TileMap.Events.UNLOADED,this.buildAStarGraph,this);
            this.tileMap.off(pow2.TileMap.Events.LOADED,this.buildAStarGraph,this);
         return super.disconnectComponent();
      }

      buildAStarGraph() {
         var layers:tiled.ITiledLayer[] = this.tileMap.getLayers();
         var l:number = layers.length;

         var grid = new Array(this.tileMap.bounds.extent.x);
         for(var x:number = 0; x < this.tileMap.bounds.extent.x; x++){
            grid[x] = new Array(this.tileMap.bounds.extent.y);
         }

         for(var x:number = 0; x < this.tileMap.bounds.extent.x; x++){
            for(var y:number = 0; y < this.tileMap.bounds.extent.y; y++){

               // Tile Weights, the higher the value the more avoided the
               // tile will be in output paths.

               // 10   - neutral path, can walk, don't particularly care for it.
               // 1    - desired path, can walk and tend toward it over netural.
               // 1000 - blocked path, can't walk, avoid at all costs.
               var weight:number = 10;
               var blocked:boolean = false;
               for(var i = 0; i < l; i++){
                  // If there is no metadata continue
                  var terrain = this.tileMap.getTileData(layers[i],x,y);
                  if (!terrain) {
                     continue;
                  }

                  // Check to see if any layer has a passable attribute set to false,
                  // if so block the path.
                  if(terrain.passable === false){
                     weight = 1000;
                     blocked = true;
                  }
                  else if(terrain.isPath === true){
                     weight = 1;
                  }
               }
               grid[x][y] = weight;
            }
         }

         // TOOD: Tiled Editor format is KILLIN' me.
         _.each(this.tileMap.features.objects,(o:any) => {
            var obj:any = o.properties;
            if(!obj){
               return;
            }
            var collideTypes:string[] = PlayerComponent.COLLIDE_TYPES;
            if(obj.passable === true || !obj.type){
               return;
            }
            if(_.indexOf(collideTypes, obj.type) !== -1){
               var x:number = o.x / o.width | 0;
               var y:number = o.y / o.height | 0;
               if(!obj.passable && this.tileMap.bounds.pointInRect(x,y)){
                  grid[x][y] = 100;
               }
            }
         });
         this._graph = new Graph(grid);
      }

      calculatePath(from:Point,to:Point):Point[]{
         if(!this._graph){
            this.buildAStarGraph();
         }
         if(!this._graph || !this._graph.nodes){
            throw new Error("Invalid AStar graph");
         }
         // Treat out of range errors as non-critical, and just
         // return an empty array.
         if(from.x >= this._graph.nodes.length || from.x < 0){
            return [];
         }
         if(from.y >= this._graph.nodes[from.x].length){
            return [];
         }
         if(to.x >= this._graph.nodes.length || to.x < 0){
            return [];
         }
         if(to.y >= this._graph.nodes[to.x].length){
            return [];
         }
         var start = this._graph.nodes[from.x][from.y];
         var end = this._graph.nodes[to.x][to.y];
         var result = astar.search(this._graph.nodes, start, end);
         return _.map(result,(graphNode:any) => {
            return new Point(graphNode.pos.x,graphNode.pos.y);
         });
      }
   }
}
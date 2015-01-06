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

/// <reference path="../tileComponent.ts" />

module pow2.tile.components {
   declare var astar:any;
   declare var Graph:any;

   /**
    * A component that can calculate A-star paths.
    */
   export class PathComponent extends TileComponent {

      _graph:any = null; // Astar graph object

      constructor(public tileMap:pow2.TileMap) {
         super();
      }

      connectComponent():boolean {
         return super.connectComponent() && !!this.tileMap;
      }

      syncComponent():boolean {
         this.tileMap.off(pow2.TileMap.Events.LOADED,this.generateAStarGraph,this);
         this.tileMap.on(pow2.TileMap.Events.LOADED,this.generateAStarGraph,this);
         return super.syncComponent();
      }
      disconnectComponent():boolean {
            this.tileMap.off(pow2.TileMap.Events.UNLOADED,this.generateAStarGraph,this);
            this.tileMap.off(pow2.TileMap.Events.LOADED,this.generateAStarGraph,this);
         return super.disconnectComponent();
      }

      /**
       * Do the meaty part of populating the _graph
       */
      generateAStarGraph() {}

      calculatePath(from:Point,to:Point):Point[]{
         if(!this._graph){
            this.generateAStarGraph();
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
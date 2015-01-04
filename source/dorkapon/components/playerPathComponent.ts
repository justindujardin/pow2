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

///<reference path="../index.ts"/>

module dorkapon.components {

   declare var Graph:any;

   /**
    * These are currently hardcoded to specific tile set GID numbers that
    * correspond to the various connector graphics used to represent horizontal
    * and vertical paths.
    *
    * These specific textures are used to dynamically build paths between nodes.
    */
   export enum PathTiles {
      HORIZ_LEFT = 25,
      HORIZ_CENTER = 26,
      HORIZ_RIGHT = 27,
      VERT_TOP = 34,
      VERT_MIDDLE = 35,
      VERT_BOTTOM = 36
   }

   /**
    * These are hardcoded to specific tile set GID numbers that correspond to
    * the various types of nodes a player may land on.
    *
    * These specific textures are used to indicate metadata about the tile.
    */
   export enum NodeTiles {
      YELLOW = 54,
      RED = 63,
      BLUE = 72,
      GREEN = 71
   }

   /**
    * Enumerated path weights for use in input grid creation.
    */
   export enum PathWeights {
      CAN_REST = 10,
      CAN_WALK = 5,
      BLOCKED = 1000
   }

   /**
    * Describe where in the map a node tile exists, and what type it is.
    */
   export interface INodeTile extends pow2.IPoint {
      type:NodeTiles;
   }

   /**
    * Describe where in the map a path tile exists, and what type it is.
    */
   export interface IPathTile extends pow2.IPoint {
      type:PathTiles;
   }

   /**
    * Generate an A* path given a dorkapon tile map.
    */
   export class PlayerPathComponent extends pow2.tile.components.PathComponent {

      /**
       * Get a list of INodeTile objects that exist in the tile map.
       */
      getNodes():INodeTile[] {
         var nodes = this.tileMap.getLayer('nodes');

         // Build a list of INodeTile objects.
         var mapWidth:number = this.tileMap.bounds.extent.x;
         var asNodeTile = <INodeTile[]>_.map(nodes.data,(gid:number,index:number)=>{
            switch(gid){
               case NodeTiles.RED:
               case NodeTiles.GREEN:
               case NodeTiles.BLUE:
               case NodeTiles.YELLOW:
                  var x:number = index % mapWidth;
                  var y:number = (index - x) / mapWidth;
                  return {
                     type:gid,
                     x:x,
                     y:y
                  };
               default:
                  // We don't care about this tile, it doesn't match a known NodeTile id.
                  return null;
            }
         });

         // Compact the list to remove null entries, and return a
         // list of just the nodes and their locations.
         return _.compact(asNodeTile);
      }

      getHorizPaths():IPathTile[] {
         var nodes = this.tileMap.getLayer('paths-horizontal');

         // Build a list of INodeTile objects.
         var mapWidth:number = this.tileMap.bounds.extent.x;
         var paths = <IPathTile[]>_.map(nodes.data,(gid:number,index:number)=>{
            switch(gid){
               case PathTiles.HORIZ_LEFT:
               case PathTiles.HORIZ_CENTER:
               case PathTiles.HORIZ_RIGHT:
                  var x:number = index % mapWidth;
                  var y:number = (index - x) / mapWidth;
                  return {
                     type:gid,
                     x:x,
                     y:y
                  };
               default:
                  // We don't care about this tile, it doesn't match a known PathTile id.
                  return null;
            }
         });
         // Compact the list to remove null entries, and return a
         // list of just the nodes and their locations.
         return _.compact(paths);
      }
      getVertPaths():IPathTile[] {
         var nodes = this.tileMap.getLayer('paths-vertical');

         // Build a list of INodeTile objects.
         var mapWidth:number = this.tileMap.bounds.extent.x;
         var paths = <IPathTile[]>_.map(nodes.data,(gid:number,index:number)=>{
            switch(gid){
               case PathTiles.VERT_TOP:
               case PathTiles.VERT_MIDDLE:
               case PathTiles.VERT_BOTTOM:
                  var x:number = index % mapWidth;
                  var y:number = (index - x) / mapWidth;
                  return {
                     type:gid,
                     x:x,
                     y:y
                  };
               default:
                  // We don't care about this tile, it doesn't match a known PathTile id.
                  return null;
            }
         });
         // Compact the list to remove null entries, and return a
         // list of just the nodes and their locations.
         return _.compact(paths);
      }


      generateAStarGraph() {

         var horizPaths = this.getHorizPaths();
         var vertPaths = this.getVertPaths();
         var nodes = this.getNodes();
         // Initialize a two dimensional array the size of the tileMap
         var grid = new Array(this.tileMap.bounds.extent.x);
         for(var x:number = 0; x < this.tileMap.bounds.extent.x; x++){
            var arr = (<any>Array).apply(null, Array(this.tileMap.bounds.extent.y));

            // All tiles are blocked to begin with.
            grid[x] = arr.map(()=>{
               return PathWeights.BLOCKED;
            });
         }
         // Mark all the paths are walkable.
         _.each([].concat(horizPaths,vertPaths),(p:IPathTile)=>{
            grid[p.x][p.y] = PathWeights.CAN_WALK;
         });
         // Mark that the path can end at nodes.
         _.each(nodes,(p:IPathTile)=>{
            grid[p.x][p.y] = PathWeights.CAN_REST;
         });
         this._graph = new Graph(grid);
      }
   }
}
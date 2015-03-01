/*
 Copyright (C) 2013-2015 by Justin DuJardin and Contributors

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

  /**
   * Generate an A* path given a dorkapon tile map.
   */
  export class PlayerPathComponent extends pow2.tile.components.PathComponent {

    tileMap:DorkaponTileMap;

    buildWeightedGraph():number[][] {

      var horizPaths = this.tileMap.getHorizPaths();
      var vertPaths = this.tileMap.getVertPaths();
      var nodes = this.tileMap.getNodes();
      // Initialize a two dimensional array the size of the tileMap
      var grid = new Array(this.tileMap.bounds.extent.x);
      for (var x:number = 0; x < this.tileMap.bounds.extent.x; x++) {
        var arr = (<any>Array).apply(null, Array(this.tileMap.bounds.extent.y));

        // All tiles are blocked to begin with.
        grid[x] = arr.map(()=> {
          return PathWeights.BLOCKED;
        });
      }
      // Mark all the paths are walkable.
      _.each([].concat(horizPaths, vertPaths), (p:IPathTile)=> {
        grid[p.x][p.y] = PathWeights.CAN_WALK;
      });
      // Mark that the path can end at nodes.
      _.each(nodes, (p:INodeTile)=> {
        grid[p.x][p.y] = PathWeights.CAN_REST;
      });
      return grid;
    }
  }
}
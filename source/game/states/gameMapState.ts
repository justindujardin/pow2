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

/// <reference path="../gameStateMachine.ts" />
/// <reference path="./gameCombatState.ts" />

module pow2 {

   declare var astar:any;
   declare var Graph:any;

   export class GameMapState extends State {
      static NAME:string = "map";
      name:string = GameMapState.NAME;
      transitions:IStateTransition[] = [
         new GameCombatTransition()
      ];
      mapName:string;
      mapPoint:Point;

      constructor(name:string){
         super();
         this.mapName = name;
      }

      calculatePath(from:Point,to:Point):Point[]{
         var graph = new Graph([
            [1,1,1,1],
            [0,1,1,0],
            [0,0,1,1]
         ]);

         // Treat out of range errors as non-critical, and just
         // return an empty array.
         if(from.x >= graph.nodes.length){
            return [];
         }
         if(from.y >= graph.nodes[from.x].length){
            return [];
         }
         if(to.x >= graph.nodes.length){
            return [];
         }
         if(to.y >= graph.nodes[to.x].length){
            return [];
         }

         var start = graph.nodes[from.x][from.y];
         var end = graph.nodes[to.x][to.y];
         var result = astar.search(graph.nodes, start, end);
         return _.map(result,(graphNode:any) => {
            return new Point(graphNode.pos.x,graphNode.pos.y);
         });
      }

      enter(machine:GameStateMachine){
         super.enter(machine);
         if(this.mapName && machine.player){
            machine.player.scene.once("map:loaded",(map) => {
               // TODO: Calculate path on click/touch, and move to destination.
               var path = this.calculatePath(new Point(0,0),new Point(1,2));
               if(this.mapPoint){
                  machine.player.setPoint(this.mapPoint);
               }
            });
            machine.player.tileMap.load(this.mapName);
         }
         console.log("MAPPPPPPP");
      }
      exit(machine:GameStateMachine){
         if(!machine.player){
            throw new Error("Defensive exception: I _think_ this state needs a player.");
         }
         if(!machine.player.tileMap){
            throw new Error("Defensive exception: The player must have a tileMap.");
         }
         if(machine.encounter){
            machine.encounter.resetBattleCounter();
         }
         this.mapName = machine.player.tileMap.mapName;
         this.mapPoint = machine.player.point.clone();
      }
   }
   export class GameMapTransition extends StateTransition {
      targetState:string = GameMapState.NAME;
      evaluate(machine:GameStateMachine):boolean {
         if(!super.evaluate(machine) || !machine.player){
            return false;
         }
         if(machine.getCurrentName() === GameCombatState.NAME){
            return machine.player.point.x === 1;
         }
         return true;
      }
   }
}
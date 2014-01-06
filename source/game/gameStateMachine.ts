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

/// <reference path="../core/stateMachine.ts" />
/// <reference path="./gameMapView.ts" />
/// <reference path="./components/playerComponent.ts" />
/// <reference path="./components/playerTouchComponent.ts" />

module pow2 {

   export class GameDefaultState extends State {
      static NAME:string = "default";
      name:string = GameDefaultState.NAME;
      transitions:IStateTransition[] = [
         new GameMapTransition()
      ];
   }


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

      private _validateState(machine:GameStateMachine){
         if(!machine.player){
            throw new Error("Defensive exception: I _think_ this state needs a player.");
         }
         if(!machine.player.tileMap){
            throw new Error("Defensive exception: The player must have a tileMap.");
         }
      }

      enter(machine:GameStateMachine){
         super.enter(machine);
         if(this.mapName && machine.player){
            machine.player.scene.once("map:loaded",(map) => {
               if(this.mapPoint){
                  machine.player.setPoint(this.mapPoint);
               }
            });
            machine.player.tileMap.load(this.mapName);
         }
         console.log("MAPPPPPPP");
      }
      exit(machine:GameStateMachine){
         this._validateState(machine);
         this.mapName = machine.player.tileMap.mapName;
         this.mapPoint = machine.player.point.clone();
      }
   }
   export class GameMapTransition extends StateTransition {
      targetState:string = GameMapState.NAME;
      evaluate(machine:GameStateMachine):boolean {
         if(!super.evaluate(machine) || !machine.player || !machine.view){
            return false;
         }
         if(machine.getCurrentName() === GameCombatState.NAME){
            return machine.player.point.x === 1;
         }
         return true;
      }
   }

   export class GameCombatState extends State {
      static NAME:string = "combat";
      name:string = GameCombatState.NAME;
      transitions:IStateTransition[] = [
         new GameMapTransition()
      ];
      enter(machine:GameStateMachine){
         super.enter(machine);
         var opponent:GameFeatureObject = machine.combatant;
         machine.player.scene.once("map:loaded",(map) => {
            map.addFeature({
               properties:{
                  type:'sign',
                  icon:opponent.icon
               },
               x:2 * 16,
               y:3 * 16,
               width:1,
               height:1
            });
            console.log("Transition to combat");
            machine.player.setPoint(new Point(4,3));
         });
         machine.player.tileMap.load("combat");
         console.log("FIGHT!!!");
      }
   }
   export class GameCombatTransition extends StateTransition {
      targetState:string = GameCombatState.NAME;
      evaluate(machine:GameStateMachine):boolean {
         if(!super.evaluate(machine) || !machine.player || !machine.player.tileMap){
            return false;
         }
         var coll = <CollisionComponent>machine.player.findComponent(CollisionComponent);
         if(coll){
            var results = [];
            if(coll.collide(machine.player.point.x,machine.player.point.y,GameFeatureObject,results)){
               var touched = <GameFeatureObject>_.find(results,(r:GameFeatureObject) => {
                  return !!r.findComponent(CombatFeatureComponent);
               });
               if(touched){
                  var combat = <CombatFeatureComponent>touched.findComponent(CombatFeatureComponent);
                  if(combat.isEntered){
                     machine.combatant = touched;
                     return true;
                  }
               }
            }
         }
         return false;
      }
   }

   // Implementation
   // -------------------------------------------------------------------------
   export class GameStateMachine extends StateMachine {
      defaultState:string = GameDefaultState.NAME;
      player:TileObject = null;
      combatant:GameFeatureObject = null;
      view:GameMapView = null;
      states:IState[] = [
         new GameDefaultState(),
         new GameMapState("town"),
         new GameCombatState()
      ];

      setGameView(view:GameMapView){
         this.view = view;
      }

      tick(elapsed:number){
         super.tick(elapsed);
         if(this.player){
            return;
         }
         if(this.world && this.world.scene){
            var scene:Scene = this.world.scene;
            this.player = scene.objectByComponent(PlayerComponent);
         }
      }
  }
}
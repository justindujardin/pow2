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

/// <reference path="../../lib/pow2.d.ts" />

module dorkapon {

   export class DorkaponInitGame extends pow2.State {
      static NAME:string = "init-game";
      name:string = DorkaponInitGame.NAME;
      enter(machine:DorkaponStateMachine){
         super.enter(machine);
         machine.setCurrentState(DorkaponBeginTurns.NAME);
      }
   }
   export class DorkaponBeginTurns extends pow2.State {
      static NAME:string = "begin-turns";
      name:string = DorkaponBeginTurns.NAME;

      enter(machine:DorkaponStateMachine){
         super.enter(machine);
         machine.playerQueue = machine.playerPool.slice();
         machine.currentPlayer = machine.playerQueue.shift();
         machine.setCurrentState(DorkaponPlayerTurn.NAME);
      }
   }

   export interface IPlayerTurnEvent {
      player:objects.DorkaponEntity;
   }
   export class DorkaponPlayerTurn extends pow2.State {
      static NAME:string = "player-turn";
      static EVENT:string = "player:turn";
      name:string = DorkaponPlayerTurn.NAME;
      tileMap:pow2.GameTileMap;
      enter(machine:DorkaponStateMachine){
         super.enter(machine);

         var player = <components.PlayerComponent>machine.currentPlayer.findComponent(components.PlayerComponent);
         var data:IPlayerTurnEvent = {
            player:machine.currentPlayer
         };
         data.player.model.set({
            moves: Math.floor(Math.random() * 6) + 1
         });
         machine.notify(DorkaponPlayerTurn.EVENT,data,()=>{
            machine.setCurrentState(DorkaponPlayerTurnEnd.NAME);
         });
      }

   }
   export class DorkaponPlayerTurnEnd extends pow2.State {
      static NAME:string = "player-turn-end";
      static EVENT:string = "player:turn-end";
      name:string = DorkaponPlayerTurnEnd.NAME;
      enter(machine:DorkaponStateMachine){
         super.enter(machine);
         var data:IPlayerTurnEvent = {
            player:machine.currentPlayer
         };
         machine.notify(DorkaponPlayerTurnEnd.EVENT,data,()=>{
            if(machine.playerQueue.length > 0){
               machine.currentPlayer = machine.playerQueue.shift();
               console.log("Next turn is: " + machine.currentPlayer.toString());
               machine.setCurrentState(DorkaponPlayerTurn.NAME);
            }
            else {
               machine.setCurrentState(DorkaponBeginTurns.NAME);
            }
         });
      }
   }

   export class DorkaponStateMachine extends pow2.StateMachine {
      world:DorkaponGameWorld;
      model:pow2.GameStateModel = new pow2.GameStateModel();
      defaultState:string = DorkaponInitGame.NAME;
      factory:pow2.EntityContainerResource;
      currentPlayer:objects.DorkaponEntity = null;
      playerPool:objects.DorkaponEntity[] = [];
      playerQueue:objects.DorkaponEntity[] = [];
      states:pow2.IState[] = [
         new DorkaponInitGame(),
         new DorkaponBeginTurns(),
         new DorkaponPlayerTurn(),
         new DorkaponPlayerTurnEnd()
      ];
      constructor(){
         super();
         pow2.ResourceLoader.get().load('entities/dorkapon.powEntities',(factory:pow2.EntityContainerResource)=>{
            this.factory = factory;
         });
      }
   }
}

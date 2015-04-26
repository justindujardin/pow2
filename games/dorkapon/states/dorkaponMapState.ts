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

/// <reference path="../../../lib/pow2.d.ts" />

module dorkapon {

  export class DorkaponMapStateMachine extends pow2.StateMachine {
    world:DorkaponGameWorld;

    playerPool:objects.DorkaponEntity[] = [];
    playerQueue:objects.DorkaponEntity[] = [];

    /**
     * The active player [DorkaponEntity] object.
     */
    currentPlayer:objects.DorkaponEntity = null;
    /**
     * The active player last contacted node.
     */
    currentNode:components.MapNodeComponent = null;


    states:pow2.IState[] = [
      new states.DorkaponInitGame(),
      new states.DorkaponBeginTurns(),
      new states.DorkaponPlayerTurn(),
      new states.DorkaponPlayerTurnEnd()
    ];

  }

}

module dorkapon.states {

  export class DorkaponInitGame extends pow2.State {
    static NAME:string = "init-game";
    name:string = DorkaponInitGame.NAME;

    enter(machine:DorkaponMapStateMachine) {
      super.enter(machine);
      machine.setCurrentState(DorkaponBeginTurns.NAME);
    }
  }
  export class DorkaponBeginTurns extends pow2.State {
    static NAME:string = "begin-turns";
    name:string = DorkaponBeginTurns.NAME;

    enter(machine:DorkaponMapStateMachine) {
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
    tileMap:DorkaponTileMap;

    enter(machine:DorkaponMapStateMachine) {
      super.enter(machine);
      var data:IPlayerTurnEvent = {
        player: machine.currentPlayer
      };
      data.player.model.set({
        moves: Math.floor(Math.random() * 6) + 1
      });
      machine.notify(DorkaponPlayerTurn.EVENT, data, ()=> {
        machine.setCurrentState(DorkaponPlayerTurnEnd.NAME);
      });
    }

  }
  export class DorkaponPlayerTurnEnd extends pow2.State {
    static NAME:string = "player-turn-end";
    static EVENT:string = "player:turn-end";
    name:string = DorkaponPlayerTurnEnd.NAME;

    enter(machine:DorkaponMapStateMachine) {
      super.enter(machine);
      var data:IPlayerTurnEvent = {
        player: machine.currentPlayer
      };
      machine.notify(DorkaponPlayerTurnEnd.EVENT, data, ()=> {
        if (machine.playerQueue.length > 0) {
          machine.currentPlayer = machine.playerQueue.shift();
          console.log("Next turn is: " + machine.currentPlayer.toString());
          machine.setCurrentState(DorkaponPlayerTurn.NAME);
        }
        else {
          // TODO: Defensive aesthetic delay, remove.
          _.delay(()=> {
            // TODO: This should probably do something more intelligent
            machine.setCurrentState(DorkaponBeginTurns.NAME);
          }, 500);
        }
      });
    }
  }
}

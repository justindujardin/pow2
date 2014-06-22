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

/// <reference path="../../lib/pow2.d.ts" />
/// <reference path="./gameMapView.ts" />
/// <reference path="./components/playerComponent.ts" />
/// <reference path="./components/playerTouchComponent.ts" />
/// <reference path="./states/gameMapState.ts"/>
/// <reference path="./models/heroModel.ts"/>
/// <reference path="./models/gameStateModel.ts"/>

/// <reference path="../combat/gameCombatStateMachine.ts"/>
module pow2 {

   export class GameDefaultState extends State {
      static NAME:string = "default";
      name:string = GameDefaultState.NAME;
   }

   // -------------------------------------------------------------------------
   // TODO: This does not need to be time ticked.   Manual evaluation and state
   // changing would be more appropriate.
   export class GameStateMachine extends StateMachine {
      world:GameWorld;
      model:GameStateModel = null;
      defaultState:string = GameDefaultState.NAME;
      player:TileObject = null;
      encounterInfo:IZoneMatch = null;
      encounter:IGameEncounter = null;
      states:IState[] = [
         new GameDefaultState(),
         new GameMapState(''),
         new GameCombatState()
      ];
      onAddToWorld(world){
         super.onAddToWorld(world);
         GameStateModel.getDataSource();
         this.model = world.model || new GameStateModel();
      }

      setCurrentState(newState:any):boolean{
         if(super.setCurrentState(newState)){
            this.update(this);
            return true;
         }
         return false;
      }
      update(data?:any){
         if(this.world && this.world.scene){
            var scene:Scene = this.world.scene;
            this.player = <TileObject>scene.objectByComponent(PlayerComponent);
         }
         super.update(data);
      }
  }
}
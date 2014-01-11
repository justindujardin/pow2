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
/// <reference path="./states/gameMapState.ts"/>
/// <reference path="./states/gameCombatState.ts"/>
module pow2 {

   export class GameDefaultState extends State {
      static NAME:string = "default";
      name:string = GameDefaultState.NAME;
      transitions:IStateTransition[] = [
         new GameMapTransition()
      ];
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

      updatePlayer(){
         if(this.world && this.world.scene){
            var scene:Scene = this.world.scene;
            this.player = scene.objectByComponent(PlayerComponent);
         }
      }

      tick(elapsed:number){
         super.tick(elapsed);
         this.updatePlayer();
      }
  }
}
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
/// <reference path="./components/combatEncounterComponent.ts" />
/// <reference path="./states/gameMapState.ts"/>
/// <reference path="./models/heroModel.ts"/>
/// <reference path="./states/gameCombatStateMachine.ts"/>
/// <reference path="./models/gameStateModel.ts"/>

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
   export class GameStateMachine extends TickedStateMachine {
      model:GameStateModel = new GameStateModel();
      defaultState:string = GameDefaultState.NAME;
      player:TileObject = null;
      encounter:CombatEncounterComponent = null;
      combatant:TileObject = null;
      tickRateMS:number = 300;
      states:IState[] = [
         new GameDefaultState(),
         new GameMapState("town"),
         new GameCombatState()
      ];
      private _elapsed: number = 0;

      updatePlayer(){
         if(this.world && this.world.scene){
            var scene:Scene = this.world.scene;
            this.player = <TileObject>scene.objectByComponent(PlayerComponent);
            this.encounter = <CombatEncounterComponent>this.world.scene.componentByType(CombatEncounterComponent);
         }
      }

      tick(elapsed:number){
         this._elapsed += elapsed;
         if (this._elapsed < this.tickRateMS) {
            return;
         }
         // Don't subtract elapsed here, but take the modulus so that
         // if for some reason we get a HUGE elapsed, it just does one
         // tick and keeps the remainder toward the next.
         this._elapsed = this._elapsed % this.tickRateMS;

         super.tick(elapsed);
         this.updatePlayer();
      }
  }
}
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

   /**
     * Knows about the dorkapon game world and state machine.  Exposes methods
     * for interacting with the state machine on a per-player basis.
     *
     * isCurrentTurn() - check host is state machine current player
     *
    */
   export class PlayerTurnComponent extends pow2.SceneComponent {

      host:objects.DorkaponEntity;

      /**
       * The callback to signal the state machine to move on to the
       * next player's turn.
       */
      turnDone:()=>any = null;

      /**
       * Constructs with a given state machine.
       */
      constructor(
         public machine:DorkaponStateMachine){
         super();
         if(!machine){
            throw new Error(pow2.errors.INVALID_ARGUMENTS);
         }
      }

      connectComponent():boolean {
         this.machine.on(DorkaponPlayerTurn.EVENT,this._machineCapture,this);
         return super.connectComponent();
      }
      disconnectComponent():boolean {
         this.machine.off(DorkaponPlayerTurn.EVENT,this._machineCapture,this);
         return super.disconnectComponent();
      }

      /**
       * Determine if the given entity is the currently active player.
       */
      isCurrentTurn(entity:objects.DorkaponEntity=this.host):boolean {
         return this.machine.currentPlayer._uid === entity._uid;
      }

      /**
       * Subtract one move from the current player.
       */
      decrementMove(){
         var model = this.machine.currentPlayer.model;
         model.set({
            moves:model.attributes.moves-1
         });
         if(this.turnDone && model.attributes.moves <= 0){
            var playerComp = <PlayerComponent>this.host.findComponent(dorkapon.components.PlayerComponent);
            if(playerComp){
               playerComp.path.length = 0;
               var cb:any = this.turnDone;
               _.delay(cb,500);
            }
            this.turnDone = null;
         }
      }

      private _machineCapture(data:IPlayerTurnEvent) {
         if(data.player._uid === this.host._uid){
            this.turnDone = this.machine.notifyWait();
         }
      }
   }
}
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

/// <reference path="../index.ts" />

module dorkapon.components {
   export class MapNodeComponent extends pow2.GameComponent {
      public world:DorkaponGameWorld = <DorkaponGameWorld>pow2.getWorld(dorkapon.NAME);

      eventText(action:string){
         console.log(action + " node " + this.host._uid);
      }

      entered(object:objects.DorkaponEntity):boolean {




         // ---
         // TODO: This is a hack.  Node implementations should be doing this.
         var turn = <PlayerTurnComponent>object.findComponent(PlayerTurnComponent);
         if(turn && turn.isCurrentTurn()){
            turn.decrementMove();
         }
         // ---




         if(this.world && this.world.state && this.world.state.currentPlayer){
            this.eventText("entered");
         }
         return super.entered(object);
      }
      exited(object:objects.DorkaponEntity):boolean {
         if(this.world && this.world.state && this.world.state.currentPlayer){
            this.eventText("exited");
         }
         return super.exited(object);
      }
      enter(object:objects.DorkaponEntity):boolean {
         if(this.world && this.world.state && this.world.state.currentPlayer){
            this.eventText("enter");
         }
         return super.enter(object);
      }
      exit(object:objects.DorkaponEntity):boolean {
         if(this.world && this.world.state && this.world.state.currentPlayer){
            this.eventText("exit");
         }
         return super.exit(object);
      }

   }
}
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

/// <reference path="../../scene/components/stateMachineComponent.ts" />
/// <reference path="../../tile/tileObject.ts" />
/// <reference path="../objects/gameFeatureObject.ts" />
/// <reference path="../../core/stateMachine.ts" />
/// <reference path="./playerComponent.ts" />

module pow2 {
   export class GameFSMComponent extends StateMachineComponent {
      machine: StateMachine = new StateMachine();
      hitBox:Rect = new Rect(0,0,1,1);
      hits:SceneObject[] = [];
      player:TileObject = null;

      syncComponent():boolean{
         if(!this.host || !this.host.scene || !super.syncComponent()){
            return false;
         }
         this.player = this.host.scene.objectByComponent(PlayerComponent);
         return !!this.player;
      }
      tick(elapsed:number) {
         if(this.paused || !this.machine){
            return;
         }
         // Calculate hits in Scene for machine usage.
         var scene:Scene = this.host.scene;
         if(!scene){
            return;
         }

         // Quick array clear
         this.hits.length = 0;

         // If there's a player, update this.hits with any current
         // collision objects.  We do this here so that state components and
         // transitions don't have to.
         if(!this.player){
            this.player = scene.objectByComponent(PlayerComponent);
         }
         if(this.player){
            this.hitBox.point.set(this.player.point);
            this.host.scene.db.queryRect(this.hitBox, GameFeatureObject, this.hits);
         }
         super.tick(elapsed);
      }

  }
}
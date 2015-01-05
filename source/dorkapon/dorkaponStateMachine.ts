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

   export class DorkaponBeginTurns extends pow2.State {
      static NAME:string = "initialize-turns";
      name:string = DorkaponBeginTurns.NAME;

      enter(machine:DorkaponStateMachine){
         super.enter(machine);

      }
   }
   export class DorkaponPlayerTurn extends pow2.State {
      static NAME:string = "player-turn";
      name:string = DorkaponPlayerTurn.NAME;
      parent:DorkaponStateMachine = null;
      tileMap:pow2.GameTileMap;
      constructor() {
         super();
      }
      enter(machine:DorkaponStateMachine){
         super.enter(machine);
         this.parent = machine;
         var mapUrl:string = pow2.getMapUrl('dorkapon');
         machine.world.loader.load(mapUrl,(map:pow2.TiledTMXResource)=>{
            this.tileMap = machine.factory.createObject('DorkaponMapObject',{
               resource:map
            });
         });
      }
      exit(machine:DorkaponStateMachine){
      }
   }

   export class DorkaponStateMachine extends pow2.StateMachine {
      world:DorkaponGameWorld;
      model:pow2.GameStateModel = new pow2.GameStateModel();
      defaultState:string = DorkaponBeginTurns.NAME;
      factory:pow2.EntityContainerResource;
      players:pow2.GameEntityObject[] = [];
      states:pow2.IState[] = [
         new DorkaponBeginTurns(),
         new DorkaponPlayerTurn()
      ];
      constructor(){
         super();
         pow2.ResourceLoader.get().load('entities/dorkapon.powEntities',(factory:pow2.EntityContainerResource)=>{
            this.factory = factory;
         });
      }
  }
}

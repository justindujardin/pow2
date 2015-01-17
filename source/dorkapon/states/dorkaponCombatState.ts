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

/// <reference path="../../../lib/pow2.d.ts" />

module dorkapon {

   export class DorkaponCombatStateMachine extends pow2.StateMachine {
      static Events:any = {
         FINISHED: "combat:finished"
      };

      world:DorkaponGameWorld;

      /**
       * Factory for creating game entities from powEntities templates.
       */
      factory:pow2.EntityContainerResource;
      /**
       * The currently attacking [DorkaponEntity] object.
       */
      attacker:objects.DorkaponEntity = null;

      /**
       * The currently defending [DorkaponEntity] in combat.
       */
      defender:objects.DorkaponEntity = null;

      states:pow2.IState[] = [
         new states.DorkaponCombatInit(this),
         new states.DorkaponCombatEnded(this),
         new states.DorkaponCombatChooseMoves(this),
         new states.DorkaponCombatExecuteMoves(this)
      ];

      constructor(attacker:objects.DorkaponEntity, defender:objects.DorkaponEntity, public parent:DorkaponAppStateMachine) {
         super();
         this.attacker = attacker;
         this.defender = defender;
         pow2.ResourceLoader.get().load('entities/dorkapon.powEntities', (factory:pow2.EntityContainerResource)=> {
            this.factory = factory;
         });
         this.world = pow2.getWorld<DorkaponGameWorld>(dorkapon.NAME);
      }
   }
}

module dorkapon.states {


   /**
    * Notification to determine turn order.
    */
   export interface ICombatDetermineTurnOrder {
      attacker:objects.DorkaponEntity;
      defender:objects.DorkaponEntity;
      report(player:objects.DorkaponEntity):any;
   }

   export class AppCombatStateBase extends pow2.State {
      constructor(public machine:DorkaponCombatStateMachine) {
         super();
      }
   }

   /**
    * Initialize combat between two entities, roll turns and determine
    * who attacks first.
    *
    * Transitions to [DorkaponCombatChooseMoves].
    */
   export class DorkaponCombatInit extends AppCombatStateBase {
      static NAME:string = "dorkapon-init-combat";
      static EVENT:string = DorkaponCombatInit.NAME;
      name:string = DorkaponCombatInit.NAME;

      enter(machine:DorkaponCombatStateMachine) {
         super.enter(machine);

         console.log("Roll turns and determine who attacks first.");

         var currentTurn:objects.DorkaponEntity = null;
         var data:ICombatDetermineTurnOrder = {
            attacker: machine.attacker,
            defender: machine.defender,
            report: (player:objects.DorkaponEntity) => {
               currentTurn = player;
            }
         };
         machine.notify(DorkaponCombatInit.EVENT, data, ()=> {
            machine.setCurrentState(DorkaponCombatChooseMoves.NAME);
         });

      }
   }

   export interface ICombatSummary {
      winner:objects.DorkaponEntity;
      loser:objects.DorkaponEntity;
   }

   export class DorkaponCombatEnded extends AppCombatStateBase {
      static NAME:string = "dorkapon-combat-ended";
      static EVENT:string = DorkaponCombatEnded.NAME;
      name:string = DorkaponCombatEnded.NAME;

      enter(machine:DorkaponCombatStateMachine) {
         super.enter(machine);
         var data:ICombatSummary = {
            winner: machine.attacker,
            loser: machine.defender
         };
         machine.notify(DorkaponCombatEnded.EVENT, data, ()=> {
            console.log("Combat is done.");
            machine.parent.setCurrentState(states.AppMapState.NAME);
         });
      }
   }


   export class DorkaponCombatChooseMoves extends AppCombatStateBase {
      static NAME:string = "dorkapon-combat-choose-moves";
      name:string = DorkaponCombatChooseMoves.NAME;

      enter(machine:DorkaponCombatStateMachine) {
         super.enter(machine);
         console.log("choose moves");
         machine.setCurrentState(DorkaponCombatExecuteMoves.NAME);
      }
   }
   export class DorkaponCombatExecuteMoves extends AppCombatStateBase {
      static NAME:string = "dorkapon-combat-move-execute";
      static EVENT:string = DorkaponCombatExecuteMoves.NAME;
      name:string = DorkaponCombatExecuteMoves.NAME;
      tileMap:pow2.GameTileMap;

      enter(machine:DorkaponCombatStateMachine) {
         super.enter(machine);
         // TODO: remove this scaffolding hacks to avoid horrible looping.
         console.log("execute attack from " + machine.attacker.model.get('name') + " to " + machine.defender.model.get('name'));
         _.delay(()=> {

            var done:boolean = (Math.floor(Math.random() * 10) % 2) !== 0;
            machine.setCurrentState(done ? DorkaponCombatEnded.NAME : DorkaponCombatChooseMoves.NAME);
         }, 500);
      }
   }
}

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

  export class DorkaponCombatStateMachine extends pow2.StateMachine {
    static Events:any = {
      FINISHED: "combat:finished",
      ATTACK: "combat:attack"
    };

    /**
     * The [DorkaponGameWorld]
     */
    world:DorkaponGameWorld;

    /**
     * The [DorkaponEntity] on the left side of the fight.
     */
    left:objects.DorkaponEntity;

    /**
     * The [DorkaponEntity] on the right side of the fight.
     */
    right:objects.DorkaponEntity;

    /**
     * The currently attacking [DorkaponEntity] object.
     */
    attacker:objects.DorkaponEntity;

    /**
     * The currently defending [DorkaponEntity] in combat.
     */
    defender:objects.DorkaponEntity;

    /**
     * The attacker's chosen action.
     */
    attackerMove:states.MoveChoice = null;

    /**
     * The defender's chosen action.
     */
    defenderMove:states.MoveChoice = null;

    states:pow2.IState[] = [
      new states.DorkaponCombatInit(this),
      new states.DorkaponCombatEnded(this),
      new states.DorkaponCombatChooseMoves(this),
      new states.DorkaponCombatExecuteMoves(this)
    ];

    constructor(attacker:models.DorkaponEntity,
                defender:models.DorkaponEntity,
                public scene:pow2.scene.Scene,
                public parent:DorkaponAppStateMachine) {
      super();
      this.world = pow2.getWorld<DorkaponGameWorld>(dorkapon.NAME);
      this.left = this.attacker = this.createPlayer(attacker, new pow2.Point(3, 6));
      this.right = this.defender = this.createPlayer(defender, new pow2.Point(10, 6));
    }


    createPlayer(from:models.DorkaponEntity, at?:pow2.Point):objects.DorkaponEntity {
      var sprite = <objects.DorkaponEntity>this.world.factory.createObject('DorkaponCombatPlayer', {
        model: from,
        machine: this
      });
      sprite.name = from.attributes.name;
      sprite.icon = from.attributes.icon;
      this.scene.addObject(sprite);
      sprite.setPoint(at);
      return sprite;
    }
  }
}

module dorkapon.states {

  export enum MoveChoice {
    ATTACK = 1,
    ATTACK_MAGIC,
    ATTACK_SKILL,
    STRIKE,

    DEFEND,
    DEFEND_MAGIC,
    DEFEND_SKILL,
    COUNTER
  }

  export interface ICombatAttackSummary {
    attacker:objects.DorkaponEntity;
    defender:objects.DorkaponEntity;
    attackerMove:MoveChoice;
    defenderMove:MoveChoice;
    attackerDamage:number;
    defenderDamage:number;
  }

  export interface ICombatChooseMove {
    attacker:objects.DorkaponEntity;
    defender:objects.DorkaponEntity;
    report(player:objects.DorkaponEntity, move:MoveChoice);
  }


  /**
   * Notification to determine turn order.
   */
  export interface ICombatDetermineTurnOrder {
    attacker:objects.DorkaponEntity;
    defender:objects.DorkaponEntity;
    report(first:objects.DorkaponEntity, second:objects.DorkaponEntity);
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

      if (machine.left.model instanceof models.DorkaponPlayer) {
        var render = <pow2.game.components.PlayerRenderComponent>machine.left.findComponent(pow2.game.components.PlayerRenderComponent);
        render.setHeading(pow2.game.components.Headings.EAST, false);
      }
      else if (machine.right.model instanceof models.DorkaponPlayer) {
        var render = <pow2.game.components.PlayerRenderComponent>machine.right.findComponent(pow2.game.components.PlayerRenderComponent);
        render.setHeading(pow2.game.components.Headings.WEST, false);
      }

      var currentTurn:objects.DorkaponEntity = null;
      var nextTurn:objects.DorkaponEntity = null;
      var data:ICombatDetermineTurnOrder = {
        attacker: machine.attacker,
        defender: machine.defender,
        report: (first:objects.DorkaponEntity, second:objects.DorkaponEntity) => {
          currentTurn = first;
          nextTurn = second;
        }
      };
      machine.notify(DorkaponCombatInit.EVENT, data, ()=> {
        if (!currentTurn || !nextTurn) {
          throw new Error("User did not report turn order.");
        }
        machine.attacker = currentTurn;
        machine.defender = nextTurn;
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

      machine.attacker.destroy();
      machine.defender.destroy();
      machine.notify(DorkaponCombatEnded.EVENT, data, ()=> {
        console.log("Combat is done.");
        machine.parent.setCurrentState(states.AppMapState.NAME);
      });
    }
  }


  export class DorkaponCombatChooseMoves extends AppCombatStateBase {
    static NAME:string = "dorkapon-combat-choose-moves";
    static EVENT:string = DorkaponCombatChooseMoves.NAME;
    name:string = DorkaponCombatChooseMoves.NAME;

    enter(machine:DorkaponCombatStateMachine) {
      super.enter(machine);
      console.log("choose moves");
      machine.attackerMove = null;
      machine.defenderMove = null;
      var data:ICombatChooseMove = {
        attacker: machine.attacker,
        defender: machine.defender,
        report: (player:objects.DorkaponEntity, move:MoveChoice) => {
          if (player._uid === machine.attacker._uid) {
            machine.attackerMove = move;
          }
          else if (player._uid === machine.defender._uid) {
            machine.defenderMove = move;
          }
        }
      };
      this.machine.notify(DorkaponCombatChooseMoves.EVENT, data, () => {
        machine.setCurrentState(DorkaponCombatExecuteMoves.NAME);
      });

    }

    exit(machine:DorkaponCombatStateMachine) {
      //if(!machine.attackerMove || !machine.defenderMove){
      //   throw new Error("Moves were not specified for attacker and defender.  State machine will not recover.");
      //}
      super.exit(machine);
    }
  }
  export class DorkaponCombatExecuteMoves extends AppCombatStateBase {
    static NAME:string = "dorkapon-combat-move-execute";
    static EVENT:string = DorkaponCombatExecuteMoves.NAME;
    name:string = DorkaponCombatExecuteMoves.NAME;
    tileMap:DorkaponTileMap;

    enter(machine:DorkaponCombatStateMachine) {
      super.enter(machine);
      // TODO: remove this scaffolding hacks to avoid horrible looping.
      console.log("execute attack from " + machine.attacker.model.attributes.name + " to " + machine.defender.model.attributes.name);
      var done = ()=> {
        var done:boolean = machine.defender.model.isDefeated() || machine.attacker.model.isDefeated();

        // Switch turns
        var current = machine.attacker;
        machine.attacker = machine.defender;
        machine.defender = current;

        machine.setCurrentState(done ? DorkaponCombatEnded.NAME : DorkaponCombatChooseMoves.NAME);
      };

      var player = <pow2.game.components.PlayerCombatRenderComponent>
          machine.attacker.findComponent(pow2.game.components.PlayerCombatRenderComponent);

      if (player) {
        var west:boolean = machine.attacker._uid === machine.right._uid;
        player.attackDirection = west ? pow2.game.components.Headings.WEST : pow2.game.components.Headings.EAST;
        player.attack(()=> {
          var attackDamage:number = 0;
          var defendDamage:number = 0;
          switch (machine.attackerMove) {
            case MoveChoice.ATTACK_MAGIC:
              attackDamage = machine.attacker.model.getMagic();
              break;
            case MoveChoice.ATTACK:
              attackDamage = machine.attacker.model.getAttack();
              break;
            case MoveChoice.ATTACK_SKILL:
              // TODO: Attack skills.
              break;
            case MoveChoice.STRIKE:
              attackDamage = machine.attacker.model.getAttack() * 2;
              break;
          }
          switch (machine.defenderMove) {
            case MoveChoice.DEFEND:
              if (machine.attackerMove === MoveChoice.ATTACK || machine.attackerMove === MoveChoice.STRIKE) {
                attackDamage -= machine.defender.model.getDefense();
              }
              break;
            case MoveChoice.DEFEND_MAGIC:
              if (machine.attackerMove === MoveChoice.ATTACK_MAGIC) {
                attackDamage -= machine.defender.model.getMagic();
              }
              break;
            case MoveChoice.DEFEND_SKILL:
              // TODO: Defense skills.
              break;
            case MoveChoice.COUNTER:
              if (machine.attackerMove === MoveChoice.STRIKE) {
                defendDamage = attackDamage * 2;
                attackDamage = 0;
              }
              break;
          }
          var data:ICombatAttackSummary = {
            attackerMove: machine.attackerMove,
            defenderMove: machine.defenderMove,
            attacker: machine.attacker,
            defender: machine.defender,
            attackerDamage: Math.max(Math.round(defendDamage), 0),
            defenderDamage: Math.max(Math.round(attackDamage), 0)
          };
          console.log(data);
          this.machine.notify(DorkaponCombatStateMachine.Events.ATTACK, data, done);
        });
      }
      else {
        throw new Error("No valid attack component for player: " + machine.attacker.model.attributes.name);
      }
    }
  }
}

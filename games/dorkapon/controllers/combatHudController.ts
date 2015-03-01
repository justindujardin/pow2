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
/// <reference path="../../../lib/pow2.ui.d.ts"/>

module dorkapon.controllers {
  export class CombatHudController {
    static $inject:string[] = [
      '$scope',
      '$rootScope',
      '$timeout',
      '$mdDialog',
      '$dorkapon',
      '$damageValue'
    ];

    constructor(public $scope:any,
                public $rootScope:any,
                public $timeout:ng.ITimeoutService,
                public $mdDialog:any,
                public $dorkapon:services.DorkaponService,
                public $damageValue:pow2.ui.services.DamageValueService) {
      $dorkapon.machine.on(pow2.StateMachine.Events.ENTER, (newState:pow2.IState)=> {
        if (newState.name === states.AppCombatState.NAME) {
          var combatState:states.AppCombatState = <states.AppCombatState>newState;
          console.log(combatState);
          this.$scope.$apply(()=> {
            this.$rootScope.inCombat = true;
            this.combat = combatState.machine;

          });
          this.listenCombatEvents(combatState);
        }
      });
      $dorkapon.machine.on(pow2.StateMachine.Events.EXIT, (oldState:pow2.IState)=> {
        if (oldState.name === states.AppCombatState.NAME) {
          var combatState:states.AppCombatState = <states.AppCombatState>oldState;
          this.stopListeningCombatEvents(combatState);
          this.$scope.$apply(()=> {
            this.$rootScope.inCombat = false;
            this.combat = null;
          });
        }
      });

      this.$scope.$on('$destroy', ()=> {
        if ($dorkapon.machine) {
          $dorkapon.machine.off(pow2.StateMachine.Events.ENTER, null, this);
          $dorkapon.machine.off(pow2.StateMachine.Events.EXIT, null, this);
        }
      });
      return this;
    }

    combat:dorkapon.DorkaponCombatStateMachine = null;


    getHitPointValue(object:objects.DorkaponEntity):number {
      if (!object) {
        return 0;
      }
      return Math.round(object.model.attributes.hp / object.model.attributes.maxhp * 100);
    }

    /**
     * Listen to various combat events to coordinate combat action selection
     * and dynamic state embellishments.
     *
     * @param state The combat state to listen in on.
     */
    listenCombatEvents(state:states.AppCombatState) {

      // When an attack happens, display a damage value above the character taking damage.
      state.machine.on(DorkaponCombatStateMachine.Events.ATTACK, (e:states.ICombatAttackSummary)=> {
        var done = state.machine.notifyWait();
        if (e.attackerDamage > 0) {
          e.attacker.model.damage(e.attackerDamage);
          this.$damageValue.applyDamage(e.attacker, e.attackerDamage, this.$dorkapon.world.mapView, done);
        }
        else {
          e.defender.model.damage(e.defenderDamage);
          this.$damageValue.applyDamage(e.defender, e.defenderDamage, this.$dorkapon.world.mapView, done);
        }
      });

      // When combat has ended, clear the combat HUD ui.
      state.machine.on(states.DorkaponCombatEnded.EVENT, (e:states.ICombatSummary)=> {
        this.$scope.$apply(()=> {
          this.combat = null;
        });
      }, this);

      // When combat starts, display a pick card UI to determine attack order.
      state.machine.on(states.DorkaponCombatInit.EVENT, (e:states.ICombatDetermineTurnOrder)=> {
        var done = state.machine.notifyWait();
        this.pickTurnOrderCard(e, done);
      }, this);

      // When it is time for a turn, pick moves.
      state.machine.on(states.DorkaponCombatChooseMoves.EVENT, (e:states.ICombatChooseMove)=> {
        var done = state.machine.notifyWait();
        this.pickMove(e, true, ()=> {
          this.pickMove(e, false, done);
        });
      }, this);


    }

    stopListeningCombatEvents(state:states.AppCombatState) {
      state.machine.off(null, null, this);
    }

    pickTurnOrderCard(turnOrder:states.ICombatDetermineTurnOrder, then:()=>any) {
      this.$mdDialog.show({
        controller: CombatTurnOrderController,
        templateUrl: 'games/dorkapon/dialogs/combatTurnOrder.html',
        controllerAs: 'combat',
        clickOutsideToClose: false,
        escapeToClose: false
      }).then((correct:boolean)=> {
        var first = correct ? turnOrder.attacker : turnOrder.defender;
        var second = correct ? turnOrder.defender : turnOrder.attacker;
        this.$mdDialog.hide();
        turnOrder.report(first, second);
        then && then();
      });
    }

    /**
     * Pick what type of move to execute for a player.
     * @param chooseMove The [[ICombatChooseMove]] event with details about players.
     * @param attacker True if picking for the attacker, false if for the defender.
     * @param then The callback to invoke once a move has been chosen and reported.
     */
    pickMove(chooseMove:states.ICombatChooseMove, attacker:boolean, then:()=>any) {
      this.$mdDialog.show({
        controller: CombatChooseMoveController,
        templateUrl: 'games/dorkapon/dialogs/combatChooseMove.html',
        controllerAs: 'choose',
        clickOutsideToClose: false,
        escapeToClose: false,
        locals: {
          event: chooseMove,
          attack: attacker
        },
        bindToController: true
      }).then((move:states.MoveChoice)=> {
        chooseMove.report(attacker ? chooseMove.attacker : chooseMove.defender, move);
        then && then();
      });
    }

  }

  app.controller('CombatHudController', CombatHudController);
}

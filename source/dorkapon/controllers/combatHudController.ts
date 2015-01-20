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

module dorkapon {
   export class CombatHudController {
      static $inject:string[] = [
         '$scope',
         '$rootScope',
         '$timeout',
         '$mdDialog',
         '$dorkapon'
      ];
      constructor(
         public $scope:any,
         public $rootScope:any,
         public $timeout:ng.ITimeoutService,
         public $mdDialog:any,
         public $dorkapon:services.DorkaponService
      ){
         $dorkapon.machine.on(pow2.StateMachine.Events.ENTER,(newState:pow2.IState)=>{
            if(newState.name === states.AppCombatState.NAME){
               var combatState:states.AppCombatState = <states.AppCombatState>newState;
               console.log(combatState);
               this.$scope.$apply(()=>{
                  this.$rootScope.inCombat = true;
                  this.combat = combatState.machine;

               });
               this.listenCombatEvents(combatState);
            }
         });
         $dorkapon.machine.on(pow2.StateMachine.Events.EXIT,(oldState:pow2.IState)=>{
            if(oldState.name === states.AppCombatState.NAME){
               var combatState:states.AppCombatState = <states.AppCombatState>oldState;
               this.stopListeningCombatEvents(combatState);
               this.$scope.$apply(()=>{
                  this.$rootScope.inCombat = false;
                  this.combat = null;
               });
            }
         });

         this.$scope.$on('$destroy',()=>{
            if($dorkapon.machine){
               $dorkapon.machine.off(pow2.StateMachine.Events.ENTER,null,this);
               $dorkapon.machine.off(pow2.StateMachine.Events.EXIT,null,this);
            }
         });
         return this;
      }

      combat:dorkapon.DorkaponCombatStateMachine = null;


      getHitPointValue(object:objects.DorkaponEntity):number {
         if(!object){
            return 0;
         }
         return Math.round(object.model.get('hp') / object.model.get('maxhp') * 100);
      }

      listenCombatEvents(state:states.AppCombatState) {
         state.machine.on(states.DorkaponCombatEnded.EVENT,(e:states.ICombatSummary)=>{
            console.log(e);
            this.$scope.$apply(()=>{
               this.combat = null;
            });
         },this);
         state.machine.on(states.DorkaponCombatInit.EVENT,(e:states.ICombatDetermineTurnOrder)=>{
            var done = state.machine.notifyWait();
            this.pickTurnOrderCard(e,done);
         },this);
      }
      stopListeningCombatEvents(state:states.AppCombatState) {
         state.machine.off(null,null,this);
      }

      pickTurnOrderCard(turnOrder:states.ICombatDetermineTurnOrder,then:()=>any) {
         this.$mdDialog.show({
            controller: CombatTurnOrderController,
            templateUrl: 'source/dorkapon/controllers/combatTurnOrder.html',
            controllerAs: 'combat'
         }).then((correct:boolean)=>{
            var first = correct ? turnOrder.attacker : turnOrder.defender;
            var second = correct ? turnOrder.defender : turnOrder.attacker;
            this.$mdDialog.hide();
            turnOrder.report(first,second);
            then && then();
         });
      }

   }

   app.controller('CombatHudController', CombatHudController);
}

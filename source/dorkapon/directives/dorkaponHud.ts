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

/// <reference path="../services/dorkaponService.ts"/>

module dorkapon.directives {

   export class DorkaponHudController implements pow2.IProcessObject {
      static $inject:string[] = ['$dorkapon','$scope','$timeout','powAlert'];
      constructor(
         public $dorkapon:services.DorkaponService,
         public scope:any,
         public $timeout:any,
         public powAlert:pow2.ui.PowAlertService) {
         $dorkapon.world.time.addObject(this);
         scope.$on('$destroy',()=>{
            $dorkapon.world.time.removeObject(this);
         });
      }

      /**
       * The current player turn.
       */
      turn:dorkapon.states.IPlayerTurnEvent = null;

      combat:dorkapon.DorkaponCombatStateMachine = null;


      // Card picking hacks
      leftText:string;
      rightText:string;
      left:boolean;
      right:boolean;
      picking:boolean = false;
      pickCorrect:boolean = false;
      pick:any = null;

      listenCombatEvents(state:states.AppCombatState) {
         state.machine.on(states.DorkaponCombatEnded.EVENT,(e:states.ICombatSummary)=>{
            console.log(e);
            this.scope.$apply(()=>{
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
         this.scope.$apply(()=>{
            this.picking = true;
            this.left = null;
            this.right = null;
            this.leftText = "?";
            this.rightText = "?";
            this.pickCorrect = false;
            this.pick = (left:boolean) => {
               var leftFirst:boolean = _.random(0,100) > 50;
               this.leftText = leftFirst ? "✓" : "✗";
               this.rightText = leftFirst ? "✗" : "✓";
               this.pick = null;
               this.pickCorrect = left === leftFirst;
               var first = this.pickCorrect ? turnOrder.attacker : turnOrder.defender;
               var second = this.pickCorrect ? turnOrder.defender : turnOrder.attacker;
               this.$timeout(()=>{
                  this.picking = false;
                  turnOrder.report(first,second);
                  then && then();
               },2000);
            };
         });

      }

   }

   app.directive('dorkaponHud', [
      '$dorkapon',
      '$compile',
      function ($dorkapon:services.DorkaponService,$compile) {
         return {
            restrict: 'E',
            replace:true,
            templateUrl: '/source/dorkapon/directives/dorkaponHud.html',
            controller:DorkaponHudController,
            controllerAs:"hud",
            link:(scope, element, attrs,controller:DorkaponHudController) => {
               var changeHandler:any = () => {
                  scope.$$phase || scope.$digest();
               };

               $dorkapon.machine.on(pow2.StateMachine.Events.ENTER,(newState:pow2.IState)=>{
                  if(newState.name === states.AppMapState.NAME){
                     var mapState:states.AppMapState = <states.AppMapState>newState;
                     mapState.machine.on(states.DorkaponPlayerTurn.EVENT,(e:states.IPlayerTurnEvent)=>{
                        scope.$apply(()=>{
                           controller.turn = e;
                        });
                        e.player.model.on('change',changeHandler);
                     },this);
                     mapState.machine.on(states.DorkaponPlayerTurnEnd.EVENT,(e:states.IPlayerTurnEvent)=>{
                        e.player.model.off('change',changeHandler);
                        scope.$apply(()=>{
                           controller.turn = null;
                        });
                     },this);
                  }
                  else if(newState.name === states.AppCombatState.NAME){
                     var combatState:states.AppCombatState = <states.AppCombatState>newState;
                     console.log(combatState);
                     scope.$apply(()=>{
                        controller.combat = combatState.machine;
                     });
                     controller.listenCombatEvents(combatState);
                  }
               });
               $dorkapon.machine.on(pow2.StateMachine.Events.EXIT,(oldState:pow2.IState)=>{
                  if(oldState.name === states.AppMapState.NAME){
                     var mapState:states.AppMapState = <states.AppMapState>oldState;
                     mapState.machine.off(states.DorkaponPlayerTurn.EVENT,null,this);
                     mapState.machine.off(states.DorkaponPlayerTurnEnd.EVENT,null,this);
                  }
                  else if(oldState.name === states.AppCombatState.NAME){
                     var combatState:states.AppCombatState = <states.AppCombatState>oldState;
                     controller.stopListeningCombatEvents(combatState);
                     scope.$apply(()=>{
                        controller.combat = null;
                     });
                  }
               });

               scope.$on('$destroy',()=>{
                  if($dorkapon.machine){
                     $dorkapon.machine.off(pow2.StateMachine.Events.ENTER,null,this);
                     $dorkapon.machine.off(pow2.StateMachine.Events.EXIT,null,this);
                  }
               });
            }
         };
      }]);

}


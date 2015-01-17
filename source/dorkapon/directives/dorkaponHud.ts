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
      static $inject:string[] = ['$dorkapon','$scope','powAlert'];
      constructor(
         public $dorkapon:services.DorkaponService,
         public $scope:any,
         public powAlert:pow2.ui.PowAlertService) {
         $dorkapon.world.time.addObject(this);
         $scope.$on('$destroy',()=>{
            $dorkapon.world.time.removeObject(this);
         });
      }

      /**
       * The current player turn.
       */
      turn:dorkapon.states.IPlayerTurnEvent = null;

      combat:dorkapon.DorkaponCombatStateMachine = null;

      /*
       * Dumb hack to simulate turn ending and such.
       * Called from the template with a button ng-click.
       *
       * TODO: Remove when actual turns are a thing.
       */
      doneCallback:any = null;
      done() {
         if(this.doneCallback){
            this.doneCallback();
            this.doneCallback = null;
         }
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
                     combatState.parent.on(states.DorkaponCombatEnded.EVENT,(e:states.ICombatSummary)=>{
                        console.log(e);
                        scope.$apply(()=>{
                           controller.combat = null;
                        });
                     },this);
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


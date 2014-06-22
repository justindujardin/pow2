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
/// <reference path="../services/gameService.ts"/>
module pow2.ui {
   app.directive('combatView', ['game',function (game:PowGameService) {
      return {
         restrict: 'E',
         replace:true,
         templateUrl: '/source/ui/directives/combatView.html',
         controller:($scope) => {
            $scope.getMemberClass = (member,focused) => {
               var result:string[] = [];
               if(focused && focused.model && member.model.get('name') === focused.model.get('name')){
                  result.push("focused");
               }
               return result.join(' ');
            };
         },
         link:(scope, element, attrs) => {
            var turnListener = (player:GameEntityObject) => {
               scope.$apply(()=>{
                  scope.combat = scope.combat;
               });
            };
            game.machine.on('combat:begin',(state:GameCombatState) => {
               state.machine.on('combat:beginTurn',turnListener);
            },this);
            game.machine.on('combat:end',(state:GameCombatState) => {
               state.machine.off('combat:beginTurn',turnListener);
            });
            scope.$on('$destroy',()=>{
               game.machine && game.machine.off('combat:begin',null,this);
            });
         }
      };
   }]);

}


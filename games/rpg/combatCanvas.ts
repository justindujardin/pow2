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

/// <reference path="services/gameService.ts"/>

module pow2.ui {
   app.directive('combatCanvas', ['$compile','game','$animate',function ($compile, game:PowGameService,$animate:any) {
      return {
         restrict: 'A',
         link: function ($scope, element, attrs) {
            $scope.canvas = element[0];
            var context = $scope.canvas.getContext("2d");
            context.webkitImageSmoothingEnabled = false;
            context.mozImageSmoothingEnabled = false;
            window.addEventListener('resize',onResize,false);
            var $window = $(window);
            function onResize(){
               context.canvas.width = $window.width();
               context.canvas.height = $window.height();
               context.webkitImageSmoothingEnabled = false;
               context.mozImageSmoothingEnabled = false;
            }
            var tileView = new GameCombatView(element[0], game.loader);

            // Support showing damage on character with fading animation.
            game.machine.on('enter',function(state){
               if(state.name !== GameCombatState.NAME){
                  return;
               }
               state.machine.on('combat:attack',(data:CombatAttackSummary) => {
                  var targetPos:pow2.Point = data.defender.point.clone();
                  targetPos.y -= (tileView.camera.point.y + 1.25);
                  targetPos.x -= tileView.camera.point.x;
                  var screenPos:pow2.Point = tileView.worldToScreen(targetPos,tileView.cameraScale);
                  var damageValue = $compile([
                     '<span class="damage-value',
                     (data.damage === 0 ? ' miss' : ''),
                     (data.damage < 0 ? ' heal' : ''),
                     '" style="position:absolute;left:' + screenPos.x + 'px;top:' + screenPos.y + 'px;">',
                     Math.abs(data.damage),
                     '</span>'
                  ].join(''))($scope);
                  $scope.$apply(() => {
                     $animate.enter(damageValue, element.parent()).then(() => {
                        damageValue.remove();
                     });
                  });
               });
            });

            game.machine.on('combat:begin',(state:GameCombatState) => {
               // Scope apply?
               // Transition canvas views, and such
               game.world.combatScene.addView(tileView);
               game.tileMap.scene.paused = true;

               tileView.setTileMap(state.tileMap);
               state.machine.on('combat:beginTurn',(player:GameEntityObject) => {
                  $scope.$apply(function() {
                     $scope.combat = $scope.combat;
                  });
               });

            });
            game.machine.on('combat:end',(state:GameCombatState) => {
               game.world.combatScene.removeView(tileView);
               game.tileMap.scene.paused = false;
               state.machine.off('combat:beginTurn',null,this);

            });
            onResize();
         }
      };
   }]);
}
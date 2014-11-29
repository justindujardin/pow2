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


   /**
    * Attach an HTML element to the position of a game object.
    */
   export interface UIAttachment {
      object:GameEntityObject;
      element:HTMLElement;
   }

   export class CombatViewController implements pow2.IProcessObject {
      static $inject:string[] = ['game','$scope'];
      constructor(
         public game:PowGameService,
         public $scope:any) {
         game.world.time.addObject(this);
         $scope.$on('$destroy',()=>{
            game.world.time.removeObject(this);
         });
      }
      pointer:UIAttachment = null;
      combatView:GameCombatView = null;

      tick(elapsed:number) {
         if(!this.combatView || !this.pointer || !this.pointer.object){
            return;
         }
         var targetPos:pow2.Point = this.pointer.object.point.clone();
         targetPos.y -= this.combatView.camera.point.y;
         targetPos.x -= (this.combatView.camera.point.x + 1.5);
         var screenPos:pow2.Point = this.combatView.worldToScreen(targetPos,this.combatView.cameraScale);
         var el:JQuery = $(this.pointer.element);
         el.css({
            left:screenPos.x,
            top:screenPos.y
         });
      }

      destroy(){
         if(this.pointer) {
            $(this.pointer.element).remove();
         }
         this.pointer = null;
      }

      getMemberClass(member,focused):string {
         var result:string[] = [];
         var choosing = this.$scope.choosing;
         if(choosing && choosing.model && choosing.model.get('name') === member.model.get('name')){
            result.push('choosing');
         }

         if (focused && focused.model && member.model.get('name') === focused.model.get('name')) {
            result.push('focused');
         }
         return result.join(' ');
      }
   }

   app.directive('combatView', ['game','$compile','$animate',function (game:PowGameService,$compile,$animate) {
      return {
         restrict: 'E',
         replace:true,
         templateUrl: '/source/ui/directives/combatView.html',
         controller:CombatViewController,
         controllerAs:"combatView",
         link:(scope, element, attrs,controller:CombatViewController) => {
            controller.destroy();
            var el = $compile('<span class="point-to-right" style="position:absolute;left:0;top:0;"></span>')(scope);
            var chooseTurns = (data:pow2.IChooseActionEvent) => {
               el.show();
               var choices:GameEntityObject[] = data.players.slice();
               var next = () => {
                  var p:GameEntityObject = choices.shift();
                  scope.$apply(()=>{
                     scope.choosing = p;
                  });
                  if(!p){
                     el.hide();
                     return;
                  }
                  var clickSelect = (mouse,hits) => {
                     p.scene.off('click',clickSelect);
                     data.choose(p,hits[0]);
                     next();
                  };
                  controller.pointer.object = p;
                  p.scene.on('click',clickSelect);
               };
               var combatScene:Scene = game.world.combatScene;
               if(!combatScene){
                  throw new Error("CombatView requires a combatScene to be present in the game world");
               }
               controller.combatView = combatScene.getViewOfType(GameCombatView);
               if(!controller.combatView){
                  throw new Error("CombatView requires a GameCombatView for coordinate conversions");
               }
               element.parent().append(el);
               next();
            };
            var turnListener = () => {
               scope.$apply(()=>{
                  scope.combat = scope.combat;
               });
            };
            game.machine.on('combat:begin',(state:GameCombatState) => {
               state.machine.on('combat:beginTurn',turnListener);
               state.machine.on('combat:chooseMoves',chooseTurns);
               controller.destroy();
               controller.pointer = {
                  element: el[0],
                  object:null,
                  view:controller.combatView
               };
            },this);
            game.machine.on('combat:end',(state:GameCombatState) => {
               state.machine.off('combat:beginTurn',turnListener);
               state.machine.off('combat:chooseMoves',chooseTurns);
               controller.destroy();
            });
            scope.$on('$destroy',()=>{
               game.machine && game.machine.off('combat:begin',null,this);
               controller.destroy();
            });
         }
      };
   }]);

}


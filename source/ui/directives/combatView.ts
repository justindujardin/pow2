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
      offset:pow2.Point;
      element:HTMLElement;
   }


   /**
    * A state machine to represent the various UI states involved in
    * choosing a combat action.
    *
    *     +------+   +--------+   +--------+
    *     | type |-->| target |-->| submit |
    *     +------+   +--------+   +--------+
    *
    * When the user properly selects an action type (Attack, Magic, Item)
    * and a target to apply the action to (Hero, All Enemies, etc.) the
    * submit state will apply the selection to the state machine at which
    * point the implementation may do whatever it wants.
    */
   export class ChooseActionStateMachine extends pow2.StateMachine {
      current:pow2.GameEntityObject = null;
      target:pow2.GameEntityObject = null;
      scene:pow2.Scene;
      player:pow2.PlayerCombatRenderComponent = null;
      action:pow2.CombatActionComponent = null;
      scope:any;
      constructor(
         public controller:CombatViewController,
         public data:IChooseActionEvent,
         submit:(action:pow2.CombatActionComponent)=>any){
         super();
         this.states = [
            new ChooseActionTarget(),
            new ChooseActionType(),
            new ChooseActionSubmit(submit)
         ];
         this.scope = controller.$scope;
         this.scene = <pow2.Scene>data.players[0].scene;
      }
   }

   /**
    * Choose a specific action type to apply in combat.
    */
   export class ChooseActionType extends pow2.State {
      static NAME:string = "choose-type";
      name:string = ChooseActionType.NAME;

      enter(machine:ChooseActionStateMachine) {
         if(!machine.controller || !machine.controller.pointer){
            throw new Error("Requires UIAttachment");
         }
         if(!machine.current){
            throw new Error("Requires Current Player");
         }
         var p:GameEntityObject = machine.current;
         machine.player = <pow2.PlayerCombatRenderComponent>p.findComponent(pow2.PlayerCombatRenderComponent);
         if(!machine.player){
            throw new Error("Requires player render component for combat animations.");
         }
         var pointerOffset:pow2.Point = new pow2.Point(-1,-0.25);
         machine.action = null;
         machine.target = null;

         // Enable menu selection of action type.
         var selectAction = (action:IPlayerAction) => {
            machine.action = <pow2.CombatActionComponent>action;

            machine.scope.selectAction = null;
            machine.scene.off('click',clickSelect);

            if(machine.action.canTarget()){
               machine.setCurrentState(ChooseActionTarget.NAME);
            }
            else {
               machine.setCurrentState(ChooseActionSubmit.NAME);
            }
         };
         machine.scope.selectAction = selectAction;

         var el:JQuery = $(machine.controller.pointer.element);
         if(!p){
            el.hide();
            return;
         }
         machine.scope.$apply(()=>{
            machine.controller.choosing = p;
         });

         var clickSelect = (mouse,hits) => {
            machine.scene.off('click',clickSelect);
            machine.target = hits[0];
            selectAction(<pow2.CombatAttackComponent>machine.current.findComponent(pow2.CombatAttackComponent));
         };
         machine.player.moveForward(() => {
            machine.controller.setPointerTarget(p,"right",pointerOffset);
            el.show();
            machine.scene.on('click',clickSelect);
         });
      }
      exit(machine:ChooseActionStateMachine) {
         machine.scope.$apply(()=>{
            machine.controller.choosing = null;
         });
      }
   }

   /**
    * Choose a target to apply a combat action to
    */
   export class ChooseActionTarget extends pow2.State {
      static NAME:string = "choose-target";
      name:string = ChooseActionTarget.NAME;
      enter(machine:ChooseActionStateMachine) {
         if(!machine.controller || !machine.controller.pointer){
            throw new Error("Requires UIAttachment");
         }
         var enemies:GameEntityObject[] = machine.data.enemies;

         var p:GameEntityObject = machine.target || enemies[0];
         var el:JQuery = $(machine.controller.pointer.element);
         machine.controller.addPointerClass(machine.action.getActionName());
         if(!p){
            el.hide();
            return;
         }
         var selectTarget = (target:GameEntityObject) => {
            if(machine.target && machine.target._uid === target._uid){
               machine.target = target;
               machine.scope.selectTarget = null;
               machine.scene.off('click',clickTarget);
               machine.setCurrentState(ChooseActionSubmit.NAME);
               machine.controller.targeting = false;
               return;
            }
            machine.target = target;
            machine.controller.setPointerTarget(target,"left",pointerOffset);
         };
         machine.scope.selectTarget = selectTarget;

         var pointerOffset:pow2.Point = new pow2.Point(0.5,-0.25);
         var clickTarget = (mouse,hits) => {
            selectTarget(hits[0]);
         };
         machine.controller.setPointerTarget(p,"left",pointerOffset);
         machine.scene.on('click',clickTarget);
         machine.scope.$apply(()=>{
            machine.controller.targeting = true;
         });

      }
      exit(machine:ChooseActionStateMachine) {
         machine.scope.$apply(()=>{
            machine.controller.targeting = false;
         });
      }
   }

   /**
    * Submit a selected action type and action target to the submit handler
    * implementation.
    */
   export class ChooseActionSubmit extends pow2.State {
      static NAME:string = "choose-submit";
      name:string = ChooseActionSubmit.NAME;
      constructor(public submit:(action:pow2.CombatActionComponent)=>any){
         super();
      }
      enter(machine:ChooseActionStateMachine) {
         if(!machine.current || !machine.action || !this.submit){
            throw new Error("Invalid state");
         }
         if(machine.action.canTarget() && !machine.target){
            throw new Error("Invalid target");
         }
         machine.player.moveBackward(()=>{
            if(machine.controller.pointer){
               $(machine.controller.pointer.element).hide();
            }
            machine.action.from = machine.current;
            machine.action.to = machine.target;
            machine.controller.removePointerClass(machine.action.getActionName());
            this.submit(machine.action);
         });
      }
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
      combatData:IChooseActionEvent = null;
      choosing:GameEntityObject = null;
      targeting:boolean = false;

      tick(elapsed:number) {
         if(!this.combatView || !this.pointer || !this.pointer.object){
            return;
         }
         var targetPos:pow2.Point = this.pointer.object.point.clone();
         targetPos.y = (targetPos.y - this.combatView.camera.point.y) + this.pointer.offset.y;
         targetPos.x = (targetPos.x - this.combatView.camera.point.x) + this.pointer.offset.x;
         var screenPos:pow2.Point = this.combatView.worldToScreen(targetPos,this.combatView.cameraScale);
         var el:JQuery = $(this.pointer.element);
         el.css({
            left:screenPos.x,
            top:screenPos.y
         });
      }

      setPointerTarget(object:GameEntityObject,directionClass:string="right",offset:pow2.Point=new pow2.Point()){
         var el:JQuery = $(this.pointer.element);
         el.removeClass('left right');
         el.addClass(directionClass);
         if(this.pointer){
            this.pointer.object = object;
            this.pointer.offset = offset;
         }
      }

      addPointerClass(clazz:string){
         $(this.pointer.element).addClass(clazz);
      }
      removePointerClass(clazz:string){
         $(this.pointer.element).removeClass(clazz);
      }

      destroy(){
         if(this.pointer) {
            $(this.pointer.element).remove();
         }
         this.pointer = null;
      }

      getMemberClass(member,focused):string {
         var result:string[] = [];
         var choosing = this.choosing;
         if(choosing && choosing.model && choosing.model.get('name') === member.model.get('name')){
            result.push('choosing');
         }
         if (focused && focused.model && member.model.get('name') === focused.model.get('name')) {
            result.push('focused');
         }
         return result.join(' ');
      }

      getActions():pow2.CombatActionComponent[]{
         if(!this.choosing){
            throw new Error("cannot get actions for non-existent game entity");
         }
         return <pow2.CombatActionComponent[]>this.choosing.findComponents(pow2.CombatActionComponent);
      }

      getEnemyTargets():pow2.GameEntityObject[] {
         var result:pow2.GameEntityObject[] = [];
         if(this.combatData){
            result = this.combatData.enemies;
         }
         return result;
      }
   }

   app.directive('combatView', ['game','$compile','$animate',function (game:PowGameService,$compile,$animate) {
      return {
         restrict: 'E',
         replace:true,
         templateUrl: '/source/ui/directives/combatView.html',
         controller:CombatViewController,
         controllerAs:"combatCtrl",
         link:(scope, element, attrs,controller:CombatViewController) => {
            controller.destroy();
            var el = $compile('<span class="point-to-player" style="position:absolute;left:0;top:0;"></span>')(scope);
            var chooseTurns = (data:pow2.IChooseActionEvent) => {
               controller.combatData = data;
               var combatScene:Scene = game.world.combatScene;
               if(!combatScene){
                  throw new Error("CombatView requires a combatScene to be present in the game world");
               }
               controller.combatView = combatScene.getViewOfType(GameCombatView);
               if(!controller.combatView){
                  throw new Error("CombatView requires a GameCombatView for coordinate conversions");
               }

               var chooseSubmit = (action:pow2.CombatActionComponent)=>{
                  inputState.data.choose(action);
                  next();
               };
               var inputState = new ChooseActionStateMachine(controller,data,chooseSubmit);
               inputState.data = data;
               var choices:GameEntityObject[] = data.players.slice();
               var next = () => {
                  var p:GameEntityObject = choices.shift();
                  if(!p){
                     controller.combatData = null;
                     return;
                  }
                  inputState.current = p;
                  inputState.setCurrentState(ChooseActionType.NAME);
               };

               element.parent().append(el);
               el.show();
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
                  offset:new pow2.Point(),
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


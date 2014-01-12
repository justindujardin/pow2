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

/// <reference path="../gameCombatState.ts" />
/// <reference path="../../../core/state.ts" />

module pow2 {

   // Combat Begin
   //--------------------------------------------------------------------------
   export class CombatBeginTurnState extends CombatState {
      static NAME:string = "Combat Begin Turn";
      name:string = CombatBeginTurnState.NAME;
      transitions:IStateTransition[] = [
         new CombatEndTurnTransition()
      ];
      enter(machine:CombatStateMachine){
         super.enter(machine);
         machine.currentDone = false;
         if(!machine.isFriendlyTurn()){
            this.attack(machine);
         }
      }
      keyPress(machine:CombatStateMachine,keyCode:KeyCode):boolean {
         if(!machine.isFriendlyTurn()){
            return true;
         }
         switch(keyCode){
            case KeyCode.ENTER:
               this.attack(machine);
               break;
            default:
               return super.keyPress(machine,keyCode);
         }
         return false;
      }

      attack(machine:CombatStateMachine){
         //
         var attacker:GameEntityObject = null;
         var defender:GameEntityObject = null;
         if(machine.current.id === machine.friendly.id){
            attacker = machine.friendly;
            defender = machine.enemy;
         }
         else {
            attacker = machine.enemy;
            defender = machine.friendly;
         }

         var defName:string = defender.model.get('name');
         var attName:string = attacker.model.get('name');
         var damage:number = attacker.model.attack(defender.model);
         console.log(attName + " attacked " + defName + " for (" + damage + ") damage");
         console.log(defName + " has (" + defender.model.get('hp') + ") hit points left");

         var animComp:ISceneComponent = new pow2.AnimatedSpriteComponent("attack");
         var spriteComp:ISceneComponent = new pow2.SpriteComponent({
            name:"attack",
            icon: damage > 0 ? "animHit.png" : "animMiss.png"
         });
         defender.addComponent(animComp,true);
         defender.addComponent(spriteComp);
         animComp.once('anim:done',() => {
            defender.removeComponent(animComp,true);
            defender.removeComponent(spriteComp);
            _.delay(() => { machine.currentDone = true; },500);
         });
      }
   }

   // Combat Transitions
   //--------------------------------------------------------------------------
   export class CombatBeginTurnTransition extends StateTransition {
      targetState:string = CombatBeginTurnState.NAME;
      evaluate(machine:CombatStateMachine):boolean {
         return machine.current !== null && machine.currentDone === true;
      }
   }

}
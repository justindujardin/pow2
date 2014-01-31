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
/// <reference path="../../components/damageComponent.ts" />
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
      attacksLeft:number = 0;
      current:GameEntityObject; // Used to restore scale on exit.
      enter(machine:CombatStateMachine){
         super.enter(machine);
         machine.currentDone = false;
         this.attacksLeft = 1;
         machine.current.scale = 1.5;
         this.current = machine.current;

         machine.current.scene.on('click',(mouse,hits) => {
            this.attack(machine,hits[0]);
         });
         machine.trigger("combat:beginTurn",machine.current);
         if(!machine.isFriendlyTurn()){
            this.attack(machine);
         }
      }
      exit(machine:CombatStateMachine){
         this.current.scale = 1;
         super.exit(machine);
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

      attack(machine:CombatStateMachine,defender?:GameEntityObject){
         if(this.attacksLeft <= 0){
            return;
         }
         this.attacksLeft -= 1;
         //
         var attacker:GameEntityObject = null;
         if(machine.isFriendlyTurn()){
            attacker = machine.current;
            defender = defender || machine.getRandomEnemy();
         }
         else {
            attacker = machine.current;
            defender = defender || machine.getRandomPartyMember();
         }
         _.delay(() => {
            var damage:number = attacker.model.attack(defender.model);
            var didKill:boolean = defender.model.get('hp') <= 0;
            var hit:boolean = damage > 0;
            var hitSound:string = "/data/sounds/" + (didKill ? "killed" : (hit ? "hit" : "miss"));
            var components = {
               animation: new pow2.AnimatedSpriteComponent({
                  spriteName:"attack",
                  lengthMS:350
               }),
               sprite: new pow2.SpriteComponent({
                  name:"attack",
                  icon: hit ? "animHit.png" : "animMiss.png"
               }),
               damage: new pow2.DamageComponent(),
               sound: new pow2.SoundComponent({
                  url: hitSound
               })
            };
            defender.addComponentDictionary(components);
            components.damage.once('damage:done',() => {
               if(didKill){
                  defender.visible = false;
               }
               defender.removeComponentDictionary(components);
               machine.currentDone = true;
            });
            machine.trigger("combat:attack",damage,attacker,defender);
         },150);
      }
   }

   // Combat Transitions
   //--------------------------------------------------------------------------
   export class CombatBeginTurnTransition extends StateTransition {
      targetState:string = CombatBeginTurnState.NAME;
      evaluate(machine:CombatStateMachine):boolean {
         return super.evaluate(machine) && machine.current !== null && machine.currentDone === true;
      }
   }

}
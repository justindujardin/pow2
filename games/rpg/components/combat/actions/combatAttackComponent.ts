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

/// <reference path="../combatActionComponent.ts" />

module pow2 {

   /**
    * Attack another entity in combat.
    */
   export class CombatAttackComponent extends CombatActionComponent {
      name:string = "attack";

      canBeUsedBy(entity:GameEntityObject){
         // Exclude magic casters from physical attacks
         var excludedTypes = [
            pow2.HeroTypes.LifeMage,
            pow2.HeroTypes.Necromancer
         ];
         return super.canBeUsedBy(entity) && _.indexOf(excludedTypes,entity.model.get('type')) === -1;
      }


      act(then?:pow2.IPlayerActionCallback):boolean {
         if(!this.isCurrentTurn()){
            return false;
         }
         var done = (error?:any) => {
            then && then(this,error);
            this.combat.machine.setCurrentState(CombatEndTurnState.NAME);
         };

         //
         var attacker:GameEntityObject = this.from;
         var defender:GameEntityObject = this.to;
         var attackerPlayer:pow2.PlayerCombatRenderComponent = <any>attacker.findComponent(pow2.PlayerCombatRenderComponent);
         var attack = () => {
            var damage:number = attacker.model.attack(defender.model);
            var didKill:boolean = defender.model.get('hp') <= 0;
            var hit:boolean = damage > 0;
            var defending:boolean = (defender.model instanceof pow2.HeroModel) && (<pow2.HeroModel>defender.model).defenseBuff > 0;
            var hitSound:string = "/data/sounds/" + (didKill ? "killed" : (hit ? (defending? "miss": "hit") : "miss"));
            var components = {
               animation: new pow2.AnimatedSpriteComponent({
                  spriteName:"attack",
                  lengthMS:350
               }),
               sprite: new pow2.SpriteComponent({
                  name:"attack",
                  icon: hit ? (defending ? "animSmoke.png" : "animHit.png") : "animMiss.png"
               }),
               damage: new pow2.DamageComponent(),
               sound: new pow2.SoundComponent({
                  url: hitSound,
                  volume:0.3
               })
            };
            if(!!attackerPlayer){
               attackerPlayer.setState("Moving");
            }
            defender.addComponentDictionary(components);
            components.damage.once('damage:done',() => {
               if(!!attackerPlayer){
                  attackerPlayer.setState();
               }
               if(didKill && defender.model instanceof CreatureModel){
                  _.defer(() => {
                     defender.destroy();
                  });
               }
               defender.removeComponentDictionary(components);
            });
            var data:CombatAttackSummary = {
               damage:damage,
               attacker:attacker,
               defender:defender
            };
            this.combat.machine.notify("combat:attack",data,done);
         };

         // TODO: Shouldn't be here.  This mess is currently to delay NPC attacks.
         if(!!attackerPlayer){
            attackerPlayer.attack(attack);
         }
         else {
            _.delay(() => {
               attack();
            },1000);
         }
         return true;
      }
   }
}
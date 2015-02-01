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
    * Use magic in combat.
    */
   export class CombatMagicComponent extends CombatActionComponent {
      name:string = "magic";

      canBeUsedBy(entity:GameEntityObject){
         // Include only magic casters
         var supportedTypes = [
            pow2.HeroTypes.LifeMage,
            pow2.HeroTypes.Necromancer
         ];
         return super.canBeUsedBy(entity) && _.indexOf(supportedTypes,entity.model.get('type')) !== -1;
      }

      act(then?:pow2.IPlayerActionCallback):boolean {
         if(!this.isCurrentTurn()){
            return false;
         }
         var done = (error?:any) => {
            then && then(this,error);
            this.combat.machine.setCurrentState(CombatEndTurnState.NAME);
         };
         if(!this.spell){
            console.error("null spell to cast");
            return false;
         }
         switch(this.spell.id){
            case "heal":
               return this.healSpell(done);
               break;
            case "push":
               return this.hurtSpell(done);
               break;
         }
         return true;
      }

      healSpell(done?:(error?:any)=>any){
         //
         var caster:GameEntityObject = this.from;
         var target:GameEntityObject = this.to;
         var attackerPlayer:pow2.PlayerCombatRenderComponent = <any>caster.findComponent(pow2.PlayerCombatRenderComponent);

         attackerPlayer.magic(()=>{
            var level:number = target.model.get('level');
            var healAmount:number = -this.spell.value;
            target.model.damage(healAmount);


            var hitSound:string = "/data/sounds/heal";
            var components = {
               animation: new pow2.AnimatedSpriteComponent({
                  spriteName:"heal",
                  lengthMS:550
               }),
               sprite: new pow2.SpriteComponent({
                  name:"heal",
                  icon: "animSpellCast.png"
               }),
               sound: new pow2.SoundComponent({
                  url: hitSound,
                  volume:0.3
               })
            };
            target.addComponentDictionary(components);
            components.animation.once('animation:done',() => {
               target.removeComponentDictionary(components);
               var data:CombatAttackSummary = {
                  damage:healAmount,
                  attacker:caster,
                  defender:target
               };
               this.combat.machine.notify("combat:attack",data,done);
            });
         });

         return true;

      }
      hurtSpell(done?:(error?:any)=>any){
         //
         var attacker:GameEntityObject = this.from;
         var defender:GameEntityObject = this.to;

         var attackerPlayer:pow2.PlayerCombatRenderComponent = <any>attacker.findComponent(pow2.PlayerCombatRenderComponent);
         attackerPlayer.magic(() => {
            var damage:number = defender.model.damage(this.spell.value);
            var didKill:boolean = defender.model.get('hp') <= 0;
            var hit:boolean = damage > 0;
            var hitSound:string = "/data/sounds/" + (didKill ? "killed" : (hit ? "spell" : "miss"));
            var components = {
               animation: new pow2.AnimatedSpriteComponent({
                  spriteName:"attack",
                  lengthMS:550
               }),
               sprite: new pow2.SpriteComponent({
                  name:"attack",
                  icon: hit ? "animHitSpell.png" : "animMiss.png"
               }),
               damage: new pow2.DamageComponent(),
               sound: new pow2.SoundComponent({
                  url: hitSound,
                  volume:0.3
               })
            };
            defender.addComponentDictionary(components);
            components.damage.once('damage:done',() => {
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
         });
         return true;

      }
   }
}
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

/// <reference path="../../../types/backbone/backbone.d.ts" />
/// <reference path="../../../types/underscore/underscore.d.ts" />
/// <reference path="../../core/api.ts" />
/// <reference path="./entityModel.ts" />
/// <reference path="./creatureModel.ts" />
/// <reference path="./gameStateModel.ts" />
/// <reference path="./armorModel.ts" />
/// <reference path="./weaponModel.ts" />
module pow2 {
   var levelExpChart = [
      0,
      32,
      96,
      208,
      400,
      672,
      1056,
      1552,
      2184,
      2976
   ];


   export enum HeroType {
      Warrior = 1,
      Wizard = 2
   }
   export interface HeroModelOptions extends EntityModelOptions {
      type:HeroType;
      description:string; // An description of the hero.

      // Hidden attributes.
      baseStrength:number;
      baseAgility:number;
      baseIntelligence:number;
      baseVitality:number;

      // The experience required to advance to the next level.
      nextLevelExp:number;
      prevLevelExp:number;

   }
   export class HeroModel extends EntityModel {

      static MAX_LEVEL:number = 50;
      static MAX_ATTR:number = 50;
      weapon:WeaponModel;
      armor:ArmorModel[];
      game:GameStateModel;
      static DEFAULTS:HeroModelOptions = {
         name: "Hero",
         icon: "warrior.png",
         type: HeroType.Warrior,
         level: 1,
         exp:0,
         nextLevelExp:0,
         prevLevelExp:0,
         hp:0,
         maxHP: 6,
         description: "",
         // Hidden attributes.
         baseStrength:0,
         baseAgility:0,
         baseIntelligence:0,
         baseVitality:0
      };
      getXPForLevel(level=this.attributes.level){
         if(level == 0){
            return 0;
         }
         return levelExpChart[level-1];
      }

      defaults():any {
         return _.extend(super.defaults(), HeroModel.DEFAULTS);
      }


      getDefense():number {
         return _.reduce(this.armor,(val:number,item) => {
            return val + item.attributes.defense;
         },0);
      }

      getDamage():number {
         return ((this.weapon ? this.weapon.attributes.attack : 0) + this.attributes.strength / 2) | 0;
      }

      awardWin(defeated:CreatureModel){
         var exp:number = defeated.get('exp');
         var newExp:number = this.attributes.exp + exp;
         this.set({
            exp:newExp
         });
         if(newExp >= this.attributes.nextLevelExp){
            this.awardLevelUp();
         }

         if(this.game){
            var gold:number = this.game.get('gold');
            var newGold = (defeated.get('gold') || 0) + gold;
            this.game.set({gold:newGold});
         }
      }

      awardLevelUp(){
         var nextLevel:number = this.attributes.level+1;
         var newHP = this.getHPForLevel(nextLevel);
         this.set({
            level: nextLevel,
            maxHP: newHP,
            hp: newHP,
            strength:this.getStrengthForLevel(nextLevel),
            agility:this.getAgilityForLevel(nextLevel),
            vitality:this.getVitalityForLevel(nextLevel),
            intelligence:this.getIntelligenceForLevel(nextLevel),

            nextLevelExp:this.getXPForLevel(nextLevel+1),
            prevLevelExp:this.getXPForLevel(nextLevel)
         });
         this.trigger('levelUp',this);
      }

      parse(data:any,options?:any):any {
         try{
            if(typeof data === 'string'){
               data = JSON.parse(data);
            }
         }
         catch(e){
            console.log("Failed to load save game.");
            return {};
         }
         if(!data){
            return {};
         }
         if(data.weapon){
            var weapon = _.where(pow2.data.weapons,{name:data.weapon})[0];
            this.weapon = new WeaponModel(weapon);
         }
         this.armor = _.map(data.armor,(item) => {
            var armor = _.where(pow2.data.armor,{name:item})[0];
            return new ArmorModel(armor);
         });
         return _.omit(data,'armor','weapon');

      }

      toJSON() {
         var result = super.toJSON();
         if(this.weapon){
            result.weapon = this.weapon.get('name');
         }
         result.armor = _.map(this.armor,(p) => {
            return p.get('name');
         });
         return result;
      }

      getHPForLevel(level:number=this.attributes.level){
         return Math.floor(this.attributes.vitality * Math.pow(level,1)) + 15;
      }
      getStrengthForLevel(level:number=this.attributes.level){
         return Math.floor(this.attributes.baseStrength * Math.pow(level,0.95));
      }
      getAgilityForLevel(level:number=this.attributes.level){
         return Math.floor(this.attributes.baseAgility * Math.pow(level,0.95));
      }
      getVitalityForLevel(level:number=this.attributes.level){
         return Math.floor(this.attributes.baseVitality * Math.pow(level,0.95));
      }
      getIntelligenceForLevel(level:number=this.attributes.level){
         return Math.floor(this.attributes.baseIntelligence * Math.pow(level,0.95));
      }


      static create(type:HeroType){
         var character:HeroModel = null;
         switch(type){
            case HeroType.Warrior:
               character = new HeroModel({
                  type:type,
                  level:0,
                  icon: "warrior.png",
                  baseStrength:10,
                  baseAgility:3,
                  baseIntelligence:1,
                  baseVitality:7

               });
               break;
            case HeroType.Wizard:
               character = new HeroModel({
                  type:type,
                  level:0,
                  icon: "wizard.png",
                  baseStrength:1,
                  baseAgility:2,
                  baseIntelligence:8,
                  baseVitality:4
               });
               break;
         }
         character.awardLevelUp();
         return character;
      }
   }
}
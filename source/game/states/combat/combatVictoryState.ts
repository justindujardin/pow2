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

   export interface CombatVictorySummary {
      party:GameEntityObject[];
      enemies:GameEntityObject[];
      levels:HeroModel[];
      gold:number;
      exp:number;
   }

   export class CombatVictoryState extends CombatState {
      static NAME:string = "Combat Victory";
      name:string = CombatVictoryState.NAME;
      enter(machine:CombatStateMachine){
         super.enter(machine);
         var gold:number = 0;
         var exp: number = 0;
         _.each(machine.enemies,(nme:GameEntityObject) => {
            gold += nme.model.get('gold') || 0;
            exp += nme.model.get('exp') || 0;
         });
         machine.parent.model.addGold(gold);

         var players:GameEntityObject[] = _.reject(machine.party,(p:GameEntityObject) => {
            return p.isDefeated();
         });
         var expPerParty:number = Math.round(exp / players.length);
         var leveledHeros:HeroModel[] = [];
         _.each(players,(p:GameEntityObject) => {
            var heroModel:HeroModel = <HeroModel>p.model;
            var leveled:boolean = heroModel.awardExperience(expPerParty);
            if(leveled){
               leveledHeros.push(heroModel);
            }
         });

         var summary:CombatVictorySummary = {
            party:machine.party,
            enemies:machine.enemies,
            levels:leveledHeros,
            gold:gold,
            exp:exp
         };
         machine.trigger("combat:victory",summary);
      }

      update(machine:CombatStateMachine){
         if(machine.paused){
            return;
         }
         machine.parent.setCurrentState(GameMapState.NAME);
      }
   }
}
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

/// <reference path="../mapNodeComponent.ts" />
/// <reference path="../../states/dorkaponCombatState.ts" />

module dorkapon.components.tiles {
  export class YellowTile extends MapNodeComponent {

    machine:dorkapon.DorkaponCombatStateMachine = null;

    /**
     * Roll and present a random encounter with a bad guy.
     */
    doAction(object:objects.DorkaponEntity, then:()=>any) {

      var enemies:any[] = _.where(this.world.tables.getSheetData("enemies"), {level: 1});
      var combatState = <states.AppCombatState>this.world.state.getState(states.AppCombatState.NAME);
      var nmeTemplate = enemies[_.random(0, enemies.length - 1)];
      combatState.attacker = object.model;
      combatState.defender = models.DorkaponMonster.create(nmeTemplate);
      this.world.state.setCurrentState(combatState);
      this.world.state.on(pow2.StateMachine.Events.EXIT, (state:pow2.IState)=> {
        if (state.name === combatState.name) {
          _.defer(then);
        }
      });
      console.log("RANDOM ENCOUNTER LIKE WHOA");
    }

    enter(object:objects.DorkaponEntity):boolean {
      super.enter(object);
      console.log("YELLOW NODE");
      return true;
    }
  }
}
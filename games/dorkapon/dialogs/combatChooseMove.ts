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

module dorkapon.controllers {
  export class CombatChooseMoveController {
    static $inject:string[] = [
      '$scope',
      '$timeout',
      '$mdDialog'
    ];

    constructor(public $scope:any,
                public $timeout:ng.ITimeoutService,
                public $mdDialog:any) {
      // Defer initialization until angular can bind the locals to our instance.
      $timeout(()=> {
        if (this.event === null || this.attack === null) {
          throw new Error("Dialog must have event and attack bound to instance");
        }
        if (this.attack) {
          this.physicalText = "Attack";
          this.magicText = "Magic";
          this.specialText = "Strike";
          this.skillText = "Skill";
          this.current = this.event.attacker;
        }
        else {
          this.physicalText = "Defend";
          this.magicText = "M Defend";
          this.specialText = "Counter";
          this.skillText = "Skill";
          this.current = this.event.defender;
        }
      }, 0);
      return this;
    }

    event:states.ICombatChooseMove = null;
    attack:boolean = null;

    current:objects.DorkaponEntity = null;

    physicalText:string = "";
    magicText:string = "";
    specialText:string = "";
    skillText:string = "";

    /**
     * Select the desired move type.
     * @param type
     */
    select(type:string) {
      switch (type) {
        case 'physical':
          this.$mdDialog.hide(this.attack ? states.MoveChoice.ATTACK : states.MoveChoice.DEFEND);
          break;
        case 'magic':
          this.$mdDialog.hide(this.attack ? states.MoveChoice.ATTACK_MAGIC : states.MoveChoice.DEFEND_MAGIC);
          break;
        case 'special':
          this.$mdDialog.hide(this.attack ? states.MoveChoice.STRIKE : states.MoveChoice.COUNTER);
          break;
        case 'skill':
          this.$mdDialog.hide(this.attack ? states.MoveChoice.ATTACK_SKILL : states.MoveChoice.DEFEND_SKILL);
          break;
      }
    }
  }
  app.controller('CombatChooseMoveController', CombatChooseMoveController);
}

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
  export class CombatTurnOrderController {
    combat:dorkapon.DorkaponCombatStateMachine = null;

    // Card picking hacks
    leftText:string;
    rightText:string;
    left:boolean;
    right:boolean;
    picking:boolean;
    pickCorrect:boolean;
    pick:any;

    static $inject:string[] = [
      '$scope',
      '$timeout',
      '$mdDialog'
    ];

    constructor(public $scope:any,
                public $timeout:ng.ITimeoutService,
                public $mdDialog:any) {
      this.picking = true;
      this.left = null;
      this.right = null;
      this.leftText = "?";
      this.rightText = "?";
      this.pickCorrect = false;
      this.pick = (left:boolean) => {
        var leftFirst:boolean = _.random(0, 100) > 50;
        this.leftText = leftFirst ? "✓" : "✗";
        this.rightText = leftFirst ? "✗" : "✓";
        this.pick = null;
        this.pickCorrect = left === leftFirst;
        this.$timeout(()=> {
          this.$mdDialog.hide(this.pickCorrect);
        }, 2000);
      };
      return this;
    }

  }

  app.controller('CombatTurnOrderController', CombatTurnOrderController);
}

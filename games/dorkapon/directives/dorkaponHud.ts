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

/// <reference path="../services/dorkaponService.ts"/>

module dorkapon.directives {

  export class DorkaponHudController implements pow2.IProcessObject {
    static $inject:string[] = ['$dorkapon', '$scope', '$timeout'];

    constructor(public $dorkapon:services.DorkaponService,
                public scope:any,
                public $timeout:any) {
      $dorkapon.world.time.addObject(this);
      scope.$on('$destroy', ()=> {
        $dorkapon.world.time.removeObject(this);
      });
    }
  }

  app.directive('dorkaponHud', [
    '$dorkapon',
    '$compile',
    function ($dorkapon:services.DorkaponService, $compile) {
      return {
        restrict: 'E',
        replace: true,
        templateUrl: 'games/dorkapon/directives/dorkaponHud.html',
        controller: DorkaponHudController,
        controllerAs: "hud",
        link: (scope, element, attrs, controller:DorkaponHudController) => {
          var changeHandler:any = () => {
            scope.$$phase || scope.$digest();
          };


          scope.$on('$destroy', ()=> {
            if ($dorkapon.machine) {
              $dorkapon.machine.off(pow2.StateMachine.Events.ENTER, null, this);
              $dorkapon.machine.off(pow2.StateMachine.Events.EXIT, null, this);
            }
          });
        }
      };
    }]);

}


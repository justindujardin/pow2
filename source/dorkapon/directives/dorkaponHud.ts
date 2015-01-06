/*
 Copyright (C) 2013-2014 by Justin DuJardin and Contributors

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
      static $inject:string[] = ['$dorkapon','$scope'];
      constructor(
         public $dorkapon:services.DorkaponService,
         public $scope:any) {
         $dorkapon.world.time.addObject(this);
         $scope.$on('$destroy',()=>{
            $dorkapon.world.time.removeObject(this);
         });
      }

      /**
       * The current player turn.
       */
      turn:dorkapon.IPlayerTurnEvent = null;

      /*
       * Dumb hack to simulate turn ending and such.
       * Called from the template with a button ng-click.
       *
       * TODO: Remove when actual turns are a thing.
       */
      doneCallback:any = null;
      done() {
         if(this.doneCallback){
            this.doneCallback();
            this.doneCallback = null;
         }
      }

   }

   app.directive('dorkaponHud', [
      '$dorkapon',
      '$compile',
      function ($dorkapon:services.DorkaponService,$compile) {
         return {
            restrict: 'E',
            replace:true,
            templateUrl: '/source/dorkapon/directives/dorkaponHud.html',
            controller:DorkaponHudController,
            controllerAs:"hud",
            link:(scope, element, attrs,controller:DorkaponHudController) => {

               $dorkapon.machine.on(DorkaponPlayerTurn.EVENT,(e:IPlayerTurnEvent)=>{
                  console.log(e);
                  var done = $dorkapon.machine.notifyWait();
                  scope.$apply(()=>{
                     controller.doneCallback = done;
                     controller.turn = e;
                  });
               });

               scope.$on('$destroy',()=>{
                  $dorkapon.machine && $dorkapon.machine.off(DorkaponPlayerTurn.EVENT,null,this);
               });
            }
         };
      }]);

}


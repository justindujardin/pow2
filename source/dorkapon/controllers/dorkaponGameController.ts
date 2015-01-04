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

/// <reference path="../../ui/services/alertService.ts"/>
/// <reference path="../services/dorkaponService.ts"/>

module dorkapon.controllers {
   app.controller('DorkaponGameController',[
      '$scope',
      '$timeout',
      '$dorkapon',
      'powAlert',
      function($scope,$timeout,dorkapon:services.DorkaponGameService,powAlert:pow2.ui.PowAlertService){
         $scope.loadingTitle = "Dorkapon!";
         $scope.loadingMessage = "Asking Google for data...";
         $scope.loading = true;
         $scope.range = function(n) {
            return new Array(n);
         };
         pow2.GameStateModel.getDataSource(()=>{
            $scope.$apply(()=>{
               $scope.loadingMessage = "Loading the things...";
            });
            dorkapon.loadGame(null,()=>{
               $scope.$apply(()=>{
                  $scope.loading = false;
                  $scope.loaded = true;
               });
            });
         });
      }
   ]);
}

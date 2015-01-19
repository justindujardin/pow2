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

/// <reference path="../dorkaponMapView.ts"/>

module dorkapon.directives {
   app.directive('dorkaponMap', [
      '$compile',
      '$dorkapon',
      function ($compile, $dorkapon:dorkapon.services.DorkaponService) {
         return {
            restrict: 'A',
            link: function ($scope, element, attrs) {
               $scope.canvas = element[0];
               var context = $scope.canvas.getContext("2d");
               context.webkitImageSmoothingEnabled = false;
               context.mozImageSmoothingEnabled = false;
               window.addEventListener('resize',onResize,false);
               function onResize(){
                  context.canvas.width = 800;
                  context.canvas.height = 600;
                  element[0].width = 800;
                  element[0].height = 600;
                  context.webkitImageSmoothingEnabled = false;
                  context.mozImageSmoothingEnabled = false;
               }
               var gameView = new DorkaponMapView(element[0], $dorkapon.loader);
               $dorkapon.world.setService('mapView',gameView);
               gameView.camera.extent.set(8, 6);
               $dorkapon.world.scene.addView(gameView);
               //onResize();
            }
         };
      }
   ]);
}
